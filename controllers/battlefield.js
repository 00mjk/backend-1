import PeriodInfo from '../models/period.js';
import BattlefieldInfo from '../models/battlefield.js';
import UserInfo from '../models/user.js';
import AgentInfo from '../models/agent.js';
// import PriorityInfo from '../models/priority.js';
// import PrHistoryInfo from '../models/history.js';
// import agentFeeTableInfo from '../models/agentFee.js';
// import boxSizeInfo from '../models/boxSizes.js';
// import agentAddressTableInfo from '../models/agentAddress.js';
// import TransferGermanyInfo from '../models/transferGermany.js';
import axios from 'axios';
import mongoose from 'mongoose';
// import exec from 'child_process';
const API_PATH = 'http://crystalfiller.com/sendNotificationScript/';

async function getBattlefieldInfo() {
  const periodDate = await PeriodInfo.find();
  const dep = '6110ee0090476f3ed00446f7'; // Sales Department
  const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
  // get managers
  const managersInfoResp = await UserInfo.find({
    $or: [
      { department: dep },
      { department: dep2 }
    ]
  }).select('_id fname sname bitrixID').sort({ fname: 1 });
  // get battlefield
  const battlefieldInfoResp = await BattlefieldInfo.find({
    year: periodDate[0]['year'],
    month: periodDate[0]['month']
  }).populate('manager', '_id fname sname bitrixID workEmail');
  // get years
  const rangeInfoYearResp = await BattlefieldInfo.distinct('year');
  //get months range
  const rangeInfoMonthResp = await BattlefieldInfo.aggregate([
    { $group: { _id: "$month", startDate: { $first: "$startDate" } } },
    { $sort: { startDate: 1 } },
    { $project: { _id: 0, month: "$_id", startDate: 1 } }
  ]);
  // get agents info
  console.log('get all btl')
  const agentInfoResp = await AgentInfo.find({ onVacation: false }).select('orderAmount paymentAmount mainName name address phone commentsAddress onVacation onPause');
  return [periodDate[0], managersInfoResp, battlefieldInfoResp, rangeInfoYearResp, rangeInfoMonthResp, agentInfoResp];
}

export async function battlefield(socket, io) {
  const battlefield = await getBattlefieldInfo();
  io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
  socket.on('add_battle', async (data, callback) => {
    try {
      const {
        date,
        manager,
        sender,
        clientName,
        newClient,
        invoiceNo,
        country,
        region,
        invoiceSum,
        paymentMethod,
        comments,
        paymentStatus,
        source,
        amountReceived,
        currAmountReceived,
        orderStatus,
        notificationSent,
        receivedDate,
        startDate,
        year,
        month,
        createdAt
      } = data;
      await BattlefieldInfo.create({
        date,
        manager,
        sender,
        clientName,
        newClient,
        invoiceNo,
        country,
        region,
        invoiceSum,
        paymentMethod,
        comments,
        paymentStatus,
        source,
        amountReceived,
        currAmountReceived,
        orderStatus,
        notificationSent,
        receivedDate,
        startDate,
        year,
        month,
        createdAt
      });
      const battlefield = await getBattlefieldInfo();
      io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
      callback({ status: 'success' }); // send success response to client
    } catch (err) {
      callback({ status: 'error', message: err.message }); // send error response to client
    }
  });
  socket.on('update_battle', async (data, callback) => {
    try {
      const { _id, accountingSubmit } = data;
      await BattlefieldInfo.findByIdAndUpdate(_id, data, { new: true });
      if (accountingSubmit) {
        let axiosConfig = {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        };
        const info = JSON.stringify(data);
        axios
          .post(API_PATH, info, axiosConfig)
          .then((res) => {
            console.log('RESPONSE RECEIVED: ', res);
          })
          .catch((err) => {
            console.log('AXIOS ERROR: ', err);
          });
      }
      const battlefield = await getBattlefieldInfo();
      io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
      callback({ status: 'success' }); // send success response to client
    } catch (err) {
      callback({ status: 'error', message: err.message }); // send error response to client
    }
  });
  socket.on('update_paidsent', async (data) => {
    for (const key of Object.keys(data)) {
      const battle = data[key];
      await BattlefieldInfo.findByIdAndUpdate(data[key]['_id'], battle, { new: true });
    }
    const battlefield = await getBattlefieldInfo();
    io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
  });
  socket.on('update_period', async (data) => {
    if (data.period == 'start') {
      const { year, month, endDate } = data;
      const periodInfo = await PeriodInfo.find();
      // const periodNo = 3;
      await PeriodInfo.findOneAndUpdate(
        { _id: periodInfo[0]['_id'] },
        { startDate: endDate, year: year, month: month, endDate: null },
        {
          new: true,
          useFindAndModify: false
        }
      );
    }
    if (data.period == 'finish') {
      const { startDate, endDate } = data;
      await PeriodInfo.findOneAndUpdate(
        { startDate: startDate },
        { year: '', month: '', endDate: endDate },
        {
          new: true,
          useFindAndModify: false
        }
      );
    }
    const battlefield = await getBattlefieldInfo();
    io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
  });
  socket.on('delete_battle', async (data) => {
    await BattlefieldInfo.findByIdAndRemove(data);
    const battlefield = await getBattlefieldInfo();
    io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
  });
  socket.on('delete_many', async (data) => {
    for (const key of Object.keys(data)) {
      const { _id } = data[key];
      await BattlefieldInfo.findByIdAndRemove(_id);
    }
    const battlefield = await getBattlefieldInfo();
    io.of('/battlefield').emit('get_battlefield', { battlefield: battlefield });
  });
}

export const getSpecBattlefield = async (req, res) => {
  try {
    console.log('request spec battle')
    const periodDate = req.body;
    let battlefieldInfoResp = null;
    battlefieldInfoResp = await BattlefieldInfo.aggregate([
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
            {
              $expr: {
                $or: [
                  { $eq: [periodDate['paymentMethodFilter'], null] },
                  { $eq: ['$paymentMethod', periodDate['paymentMethodFilter']] }
                ]
              }
            },
            {
              $expr: {
                $or: [
                  { $eq: [periodDate['orderStatusFilter'], null] },
                  { $eq: ['$orderStatus', periodDate['orderStatusFilter']] }
                ]
              }
            }
          ],
          year: periodDate['year'],
          month: periodDate['month']
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'manager',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $project: {
          _id: 1,
          date: 1,
          manager: { $arrayElemAt: ['$manager', 0] },
          sender: 1,
          clientName: 1,
          newClient: 1,
          invoiceNo: 1,
          country: 1,
          region: 1,
          invoiceSum: 1,
          paymentMethod: 1,
          comments: 1,
          paymentStatus: 1,
          source: 1,
          amountReceived: 1,
          currAmountReceived: 1,
          orderStatus: 1,
          receivedDate: 1,
          startDate: 1,
          year: 1,
          month: 1,
          notificationSent: 1,
          // manager_name: 1
        }
      }
    ]);
    if (battlefieldInfoResp.length === 0) {
      battlefieldInfoResp.push({ manager: 'No Results Found' });
    }
    res.status(200).json(battlefieldInfoResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
