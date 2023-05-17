import BattlefieldInfo from '../models/battlefield.js';
import PeriodInfo from '../models/period.js';
import UserInfo from '../models/user.js';
import periodFrameInfo from '../models/periodFrame.js';
import mongoose from 'mongoose';

export const getNewClientsStat = async (req, res) => {
  try {
    //get period
    const periodDate = await PeriodInfo.find();
    // get managers
    const dep = '6110ee0090476f3ed00446f7'; // Sales Department
    const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
    const managersInfoResp = await UserInfo.find({
      $or: [
        { department: dep },
        { department: dep2 }
      ]
    }).select('_id fname sname bitrixID').sort({ fname: 1 });
    // get years
    const rangeInfoYearResp = await BattlefieldInfo.distinct('year');
    // get months range
    const rangeInfoMonthResp = await BattlefieldInfo.aggregate([
      { $group: { _id: "$month", startDate: { $first: "$startDate" } } },
      { $sort: { startDate: 1 } },
      { $project: { _id: 0, month: "$_id", startDate: 1 } }
    ]);
    // get new clients info
    const newClientsInfoResp = await BattlefieldInfo.aggregate([
      {
        $match: {
          year: periodDate[0].year,
          month: periodDate[0].month,
          newClient: true
        }
      },
      {
        $group: {
          _id: {
            clientName: '$clientName'
          },
          totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          country: { $addToSet: '$country' },
          source: { $addToSet: '$source' },
          newClient: { $first: '$newClient' },
          id: { $first: '$_id' }
        }
      },
      {
        $project: {
          clientName: '$_id.clientName',
          country: { $arrayElemAt: ['$country', 0] },
          source: { $arrayElemAt: ['$source', 0] },
          totalSaleAmount: 1,
          newClient: 1,
          id: 1
        }
      }
    ]);
    const combinedInforResp = [
      periodDate[0],
      managersInfoResp,
      rangeInfoYearResp,
      rangeInfoMonthResp,
      newClientsInfoResp
    ];
    
    res.status(200).json(combinedInforResp);
  }catch (error) {
    res.status(404).json({ message: error.message });
  }
}
export const getSelectedNewClientsStat = async (req, res) => {
  try {
    // get new clients info
    const periodDate = req.body;
    const newClientsInfoResp = await BattlefieldInfo.aggregate([
      {
        $match: {
          $and: [
            {
              $expr: {
                $or: [
                  { $eq: [periodDate['manager'], null] },
                  { $eq: ['$manager', mongoose.Types.ObjectId(periodDate['manager'])] }
                ]
              }
            },
          ],
          year: periodDate['year'],
          month: periodDate['month'],
          newClient: true
        }
      },
      {
        $group: {
          _id: {
            clientName: '$clientName'
          },
          totalSaleAmount: { $sum: { $toDouble: '$invoiceSum' } },
          country: { $addToSet: '$country' },
          source: { $addToSet: '$source' },
          newClient: { $first: '$newClient' },
          id: { $first: '$_id' }
        }
      },
      {
        $project: {
          clientName: '$_id.clientName',
          country: { $arrayElemAt: ['$country', 0] },
          source: { $arrayElemAt: ['$source', 0] },
          totalSaleAmount: 1,
          newClient: 1,
          id: 1
        }
      }
    ]);
    res.status(200).json(newClientsInfoResp);
  }catch (error) {
    res.status(404).json({ message: error.message });
  }
}

