import BattlefieldInfo from '../models/battlefield.js';
import PeriodInfo from '../models/period.js';
import PeriodFrameInfo from '../models/periodFrame.js';
import mongoose from 'mongoose';

export const getDashboardInfo = async (req, res) => {
  try {
    // get current period
    const periodDateInfo = await PeriodInfo.find();
    const id = req.body.id ? req.body.id : req.params.id
    // const id = "63f731c3e5ad1632b85a465b"
    const curPeriod = req.body.periodNo ? req.body.periodNo : periodDateInfo[0].periodNo;
    const checkYear = req.body.year ? req.body.year : periodDateInfo[0].year;
    let currDate1 = req.body.request ? req.body.request : new Date(); // get current date
    let currDate2 = req.body.request ? req.body.request : new Date(); // get current date

    let periodDateFrame = '';
    let managerCurrentInfoResponse = '';
    let managerPastInfoResponse = '';
    let getCountryStat = '';
    let getClientsStat = '';
    let getWeeklyData = '';
    let weeksRange = [];
    // if user selected to view whole year
    if(curPeriod === '0'){
      periodDateFrame = [
        {
          'year': checkYear,
          'isCurrent': true
        },
        {
          'year': String(parseInt(checkYear- 1)),
          'isCurrent': true
        },
      ]
      // get statistics data for current period
      managerCurrentInfoResponse = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: null,
            amountOfAllOrders: { $sum: 1 },
            amountOfPSOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  1,
                  0
                ]
              }
            },
            amountOfReceivedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$orderStatus', true] },
                  1,
                  0
                ]
              }
            },
            totalSaleAmount: { $sum: '$invoiceSum' },
            // totalSaleAmount: {
            //   $sum: { $toDouble: '$invoiceSum',
            //     // $cond: [
            //       // { $eq: ['$paymentStatus', 'Paid and Sent'] },
            //       // { $toDouble: '$invoiceSum' },
            //       // 0
            //     // ]
            //   }
            // },
            amountOfNewClients: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  1,
                  0
                ]
              }
            },
            totalNewClientsSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
          }
        },
        {
          $project: {
            _id: 0,
            amountOfAllOrders: 1,
            amountOfPSOrders: 1,
            amountOfReceivedOrders: 1,
            totalSaleAmount: 1,
            amountOfNewClients: 1,
            totalNewClientsSaleAmount: 1
          }
        }
      ])
      // get statistics data for previous period
      managerPastInfoResponse = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[1].year
          }
        },
        {
          $group: {
            _id: null,
            amountOfAllOrders: { $sum: 1 },
            amountOfPSOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  1,
                  0
                ]
              }
            },
            amountOfReceivedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$orderStatus', true] },
                  1,
                  0
                ]
              }
            },
            totalSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
            amountOfNewClients: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  1,
                  0
                ]
              }
            },
            totalNewClientsSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
          }
        },
        {
          $project: {
            _id: 0,
            // manager: (id),
            amountOfAllOrders: 1,
            amountOfPSOrders: 1,
            amountOfReceivedOrders: 1,
            totalSaleAmount: 1,
            amountOfNewClients: 1,
            totalNewClientsSaleAmount: 1
          }
        }
      ])
      if(managerPastInfoResponse.length === 0){
        managerPastInfoResponse = [{
          amountOfAllOrders: 0,
          amountOfPSOrders: 0,
          amountOfReceivedOrders: 0,
          totalSaleAmount: 0,
          amountOfNewClients: 0,
          totalNewClientsSaleAmount: 0
        }]
      }
      // get country sales statistics for current period
      getCountryStat = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: { country: '$country' },
            noOfOrders: { $sum: 1 },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          }
        },
        { $sort: { noOfOrders: -1 } }
      ]);
      // get clients sales statistics for current period
      getClientsStat = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: { clientName: '$clientName' },
            noOfOrders: { $sum: 1 },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          }
        },
        { $sort: { noOfOrders: -1 } }
      ]);
      weeksRange = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const monthMap = {};
      weeksRange.forEach((month, index) => {
        monthMap[month] = index + 1;
      });
      getWeeklyData = await BattlefieldInfo.aggregate([
        {
          $match: {
            $or: weeksRange.map(month => ({ month })),
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: {
              manager: '$manager',
              month: '$month',
              year: '$year'
            },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } }
          }
        },
        {
          $project: {
            manager: '$_id.manager',
            year: '$_id.year',
            month: '$_id.month',
            monthNumber: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id.month', 'January'] }, then: monthMap['January'] },
                  { case: { $eq: ['$_id.month', 'February'] }, then: monthMap['February'] },
                  { case: { $eq: ['$_id.month', 'March'] }, then: monthMap['March'] },
                  { case: { $eq: ['$_id.month', 'April'] }, then: monthMap['April'] },
                  { case: { $eq: ['$_id.month', 'May'] }, then: monthMap['May'] },
                  { case: { $eq: ['$_id.month', 'June'] }, then: monthMap['June'] },
                  { case: { $eq: ['$_id.month', 'July'] }, then: monthMap['July'] },
                  { case: { $eq: ['$_id.month', 'August'] }, then: monthMap['August'] },
                  { case: { $eq: ['$_id.month', 'September'] }, then: monthMap['September'] },
                  { case: { $eq: ['$_id.month', 'October'] }, then: monthMap['October'] },
                  { case: { $eq: ['$_id.month', 'November'] }, then: monthMap['November'] },
                  { case: { $eq: ['$_id.month', 'December'] }, then: monthMap['December'] }
                ],
                default: null
              }
            },
            totalSaleAmount: 1
          }
        },
        {
          $sort: {
            monthNumber: 1
          }
        }
      ]);
      weeksRange.reverse()
    } else{
      // get current and previous period
      const periodDateFrameInfo = await PeriodFrameInfo.aggregate([
        {
          $project: {
            periodNo: 1,
            monthSt: 1,
            monthEnd: 1,
            isCurrent: {
              $eq: ["$periodNo", curPeriod]
            },
            isPrevious: {
              $cond: {
                if: { $eq: [curPeriod, '1'] },
                then: { $in: ["$periodNo", ["6", "1"]] },
                else: { $in: ["$periodNo", [(parseInt(curPeriod) - 1).toString(), curPeriod]] }
              }
            }
          }
        },

        {
          $match: {
            $or: [
              { isCurrent: true },
              { isPrevious: true }
            ]
          }
        },
        {
          $sort: { periodNo: 1 }
        }
      ]);
      const currentPeriod = periodDateFrameInfo.find((period) => period.isCurrent);
      currentPeriod.year = checkYear
      const previousPeriod = periodDateFrameInfo.find((period) => period.isCurrent === false);
      previousPeriod.year = parseInt(currentPeriod.periodNo) > parseInt(previousPeriod.periodNo) ? checkYear : String(parseInt(checkYear- 1));
      periodDateFrame = [currentPeriod, previousPeriod]
      // get statistics data for current period
      managerCurrentInfoResponse = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[0].year,
            month: { $in: [periodDateFrame[0].monthSt, periodDateFrame[0].monthEnd] }
          }
        },
        {
          $group: {
            _id: null,
            amountOfAllOrders: { $sum: 1 },
            amountOfPSOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  1,
                  0
                ]
              }
            },
            amountOfReceivedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$orderStatus', true] },
                  1,
                  0
                ]
              }
            },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
            // totalSaleAmount: {
            //   $sum: {
            //     $cond: [
            //       { $eq: ['$paymentStatus', 'Paid and Sent'] },
            //       { $toDouble: '$invoiceSum' },
            //       0
            //     ]
            //   }
            // },
            amountOfNewClients: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  1,
                  0
                ]
              }
            },
            totalNewClientsSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
          }
        },
        {
          $project: {
            _id: 0,
            amountOfAllOrders: 1,
            amountOfPSOrders: 1,
            amountOfReceivedOrders: 1,
            totalSaleAmount: 1,
            amountOfNewClients: 1,
            totalNewClientsSaleAmount: 1
          }
        }
      ])
      if(managerCurrentInfoResponse.length === 0){
        managerCurrentInfoResponse = [{
          amountOfAllOrders: 0,
          amountOfPSOrders: 0,
          amountOfReceivedOrders: 0,
          totalSaleAmount: 0,
          amountOfNewClients: 0,
          totalNewClientsSaleAmount: 0
        }]
      }
      // get statistics data for previous period
      managerPastInfoResponse = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            year: periodDateFrame[1].year,
            month: { $in: [periodDateFrame[1].monthSt, periodDateFrame[1].monthEnd] }
          }
        },
        {
          $group: {
            _id: null,
            amountOfAllOrders: { $sum: 1 },
            amountOfPSOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  1,
                  0
                ]
              }
            },
            amountOfReceivedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$orderStatus', true] },
                  1,
                  0
                ]
              }
            },
            totalSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'Paid and Sent'] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
            amountOfNewClients: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  1,
                  0
                ]
              }
            },
            totalNewClientsSaleAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$newClient', true] },
                  { $toDouble: '$invoiceSum' },
                  0
                ]
              }
            },
          }
        },
        {
          $project: {
            _id: 0,
            // manager: (id),
            amountOfAllOrders: 1,
            amountOfPSOrders: 1,
            amountOfReceivedOrders: 1,
            totalSaleAmount: 1,
            amountOfNewClients: 1,
            totalNewClientsSaleAmount: 1
          }
        }
      ])
      if(managerPastInfoResponse.length === 0){
        managerPastInfoResponse = [{
          amountOfAllOrders: 0,
          amountOfPSOrders: 0,
          amountOfReceivedOrders: 0,
          totalSaleAmount: 0,
          amountOfNewClients: 0,
          totalNewClientsSaleAmount: 0
        }]
      }
      // get country sales statistics for current period
      getCountryStat = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            month: { $in: [periodDateFrame[0].monthSt, periodDateFrame[0].monthEnd] },
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: { country: '$country' },
            noOfOrders: { $sum: 1 },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          }
        },
        { $sort: { noOfOrders: -1 } }
      ]);
      // get clients sales statistics for current period
      getClientsStat = await BattlefieldInfo.aggregate([
        {
          $match: {
            manager: mongoose.Types.ObjectId(id),
            month: { $in: [periodDateFrame[0].monthSt, periodDateFrame[0].monthEnd] },
            year: periodDateFrame[0].year
          }
        },
        {
          $group: {
            _id: { clientName: '$clientName' },
            noOfOrders: { $sum: 1 },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          }
        },
        { $sort: { noOfOrders: -1 } }
      ]);

      // find 8 weeks from given day
      if(currDate1 === true){
        const lastDayOfMonth = new Date(periodDateFrame [0]['year'], getMonthIndex(periodDateFrame [0]['monthEnd']) + 1, 0).getDate(); // get the last day of the month using the year and month name
        currDate1 = new Date(periodDateFrame [0]['year'], getMonthIndex(periodDateFrame [0]['monthEnd']), lastDayOfMonth);
        currDate2 = new Date(periodDateFrame [0]['year'], getMonthIndex(periodDateFrame [0]['monthEnd']), lastDayOfMonth);
      }
      const findPreviousDate = (curr1, curr2) => {
        var first = curr1.getDate() - curr1.getDay() + 1;
        var last = first + 6; // last day is the first day + 6

        currDate1 = new Date(curr1.getFullYear(), curr1.getMonth(), curr1.getDate() - 7);
        currDate2 = new Date(curr2.getFullYear(), curr2.getMonth(), curr2.getDate() - 7);

        var lastday = new Date(curr1.setDate(last))
          .toLocaleDateString('en-GB')
          .split('/')
          .reverse()
          .join('-');
        var firstday = new Date(curr2.setDate(first))
          .toLocaleDateString('en-GB')
          .split('/')
          .reverse()
          .join('-');
        var combined = firstday + '||' + lastday;
        return combined;
      };
      let response = '';
      for (let i = 0; i < 8; i++) {
        response = findPreviousDate(currDate1, currDate2);
        weeksRange.push({
          monday: response.split('||')[0],
          sunday: response.split('||')[1]
        });
      }
      getWeeklyData = await BattlefieldInfo.aggregate([
        {
          $match: {
            // date: {$gte: new Date(firstday), $lt: new Date(lastday)},
            $or: [
              {
                date: {
                  $gte: new Date(weeksRange[0]['monday']),
                  $lt: new Date(weeksRange[0]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[1]['monday']),
                  $lt: new Date(weeksRange[1]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[2]['monday']),
                  $lt: new Date(weeksRange[2]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[3]['monday']),
                  $lt: new Date(weeksRange[3]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[4]['monday']),
                  $lt: new Date(weeksRange[4]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[5]['monday']),
                  $lt: new Date(weeksRange[5]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[6]['monday']),
                  $lt: new Date(weeksRange[6]['sunday'])
                }
              },
              {
                date: {
                  $gte: new Date(weeksRange[7]['monday']),
                  $lt: new Date(weeksRange[7]['sunday'])
                }
              }
            ],
            manager: mongoose.Types.ObjectId(id)
          }
        },
        {
          $group: {
            _id: {
              manager: '$manager',
              week: { $week: '$date' }
            },
            totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } }
          }
        },
        {
          $project: {
            manager: '$_id.manager',
            week: '$_id.week',
            totalSaleAmount: 1
          }
        },
        { $sort: { week: 1 } }
      ]);
    }
    const combinedInforResp = [periodDateInfo, periodDateFrame, managerCurrentInfoResponse, managerPastInfoResponse, getCountryStat, getClientsStat, getWeeklyData, weeksRange.reverse()]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMedianAndAverage = async (req, res) => {
  const id = req.body[2];
  // const id = "63f731c3e5ad1632b85a465b";
  try {
    const managerSelectedRangeInfoResponse = await BattlefieldInfo.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(req.body[0]),
            $lte: new Date(req.body[1])
          },
          manager: mongoose.Types.ObjectId(id),
        }
      },
      {
        $group: {
          _id: null,
          amountOfAllOrders: { $sum: 1 },
          amountOfPSOrders: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'Paid and Sent'] },
                1,
                0
              ]
            }
          },
          amountOfReceivedOrders: {
            $sum: {
              $cond: [
                { $eq: ['$orderStatus', true] },
                1,
                0
              ]
            }
          },
          totalSaleAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'Paid and Sent'] },
                { $toDouble: '$invoiceSum' },
                0
              ]
            }
          },
          amountOfNewClients: {
            $sum: {
              $cond: [
                { $eq: ['$newClient', true] },
                1,
                0
              ]
            }
          },
          totalNewClientsSaleAmount: {
            $sum: {
              $cond: [
                { $eq: ['$newClient', true] },
                { $toDouble: '$invoiceSum' },
                0
              ]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          amountOfAllOrders: 1,
          amountOfPSOrders: 1,
          amountOfReceivedOrders: 1,
          totalSaleAmount: 1,
          amountOfNewClients: 1,
          totalNewClientsSaleAmount: 1
        }
      }
    ])
    const managerSelectedRangeInfoMedianResponse = await BattlefieldInfo.find({
      date: {
        $gte: new Date(req.body[0]),
        $lte: new Date(req.body[1])
      },
      manager: id
    }, { invoiceSum: 1, _id: 0 });

    let medianArr = [];
    managerSelectedRangeInfoMedianResponse.map((value) => {
      medianArr.push(parseFloat(value.invoiceSum));
    });
    const median = calculateMedian(medianArr);
    const avg = calculateAvg(
      managerSelectedRangeInfoResponse[0]['totalSaleAmount'],
      managerSelectedRangeInfoResponse[0]['amountOfAllOrders']
    );
    const calculationResp = [median, avg];
    res.status(200).json(calculationResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

function calculateAvg(a, b) {
  return a / b;
}

function calculateMedian(arr) {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}
function getMonthIndex(monthName) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.indexOf(monthName);
}

// =INDEX(Ingridients!G2:G40,MATCH(C3,Ingridients!A2:A40,0))

