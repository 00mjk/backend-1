import PriorityInfo from '../models/priority.js';
import UserInfo from '../models/user.js';
import AgentInfo from '../models/agent.js';
import AgentFeeInfo from '../models/agentFee.js';
import BoxSizeInfo from '../models/boxSize.js';
import ChangeInfo from '../models/change.js';
// import BattlefieldInfo from '../models/battlefield.js';
// import TransferGermanyInfo from '../models/transferGermany.js';
// import agentFeeTableInfo from '../models/agentFee.js';
// import BoxSizeInfo from '../models/boxSizes.js';
// import agentAddressTableInfo from '../models/agentAddress.js';

import axios from 'axios';
import mongoose from 'mongoose';
// import exec from 'child_process';
const API_PATH = 'http://crystalfiller.com/newPriorityNotificationScript/';

async function getPriorityInfo() {
  // get prioirity orders
  const priorityOrderInfoResp = await PriorityInfo.find({ hidden: false })
  .select('_id paymentDate invoiceNo manager whManager packingDate sendDate logisticCom delService toxins threads managerCom pckStarted pckCompleted docsReady bookedPickup readyToShip importantOrder onHold hidden lockReason lockedBy toxThrPackaged completedOrder shouldSendNotification notificationSent createdAt client_info transferAgentSent')
  .sort({ paymentDate: 1 })
  .populate('manager', '_id fname sname bitrixID')
  .populate({
    path: 'whManager',
    select: '_id fname sname bitrixID',
    match: { _id: { $exists: true } }
  })
  .populate({
    path: 'lockedBy',
    select: '_id fname sname bitrixID',
    match: { _id: { $exists: true } }
  })
  .lean() // add this to make the result plain JavaScript objects
  .exec();
  priorityOrderInfoResp.forEach((doc) => {
    doc.testField = `${new Date(doc.paymentDate).toISOString().slice(0, 10)} ${doc.invoiceNo}`;
  });
  //get sales managers
  const dep = '6110ee0090476f3ed00446f7'; // Sales Department
  const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
  const slManagersInfoResp = await UserInfo.find({
    $or: [
      { department: dep },
      { department: dep2 }
    ]
  }).select('_id fname sname bitrixID').sort({ fname: 1 });
  //get sales managers
  const dep3 = '6110cdcaad75051374b14fc9'; // Logistics/Warehouse Department
  const whManagersInfoResp = await UserInfo.find({ department: dep3 }).select('_id fname sname bitrixID').sort({ fname: 1 });
  // get agents info
  const agentInfoResp = await AgentInfo.find({ onVacation: false }).select('orderAmount paymentAmount mainName name address phone commentsAddress onVacation onPause');
  // get agents fee 
  const agentFeeInfoResp = await AgentFeeInfo.find().select('boxSize weightKG agentFee').sort({ boxSize: 1 });
  // get box sizes
  const boxSizeInfoResp = await BoxSizeInfo.find().select('boxSizeNo width length height volWeight').sort({ boxSizeNo: 1 });

  return [priorityOrderInfoResp, slManagersInfoResp, whManagersInfoResp, agentInfoResp, agentFeeInfoResp, boxSizeInfoResp];
}

export async function priority(socket, io) {
  const priority_orders = await getPriorityInfo();
  io.of('/priority').emit('get_priority', { priority_orders: priority_orders });
  socket.on('add_priority', async (data, callback) => {
    try {
      const {
        paymentDate,
        invoiceNo,
        client_info,
        manager,
        whManager,
        packingDate,
        sendDate,
        logisticCom,
        delService,
        toxins,
        threads,
        managerCom,
        pckStarted,
        pckCompleted,
        docsReady,
        bookedPickup,
        readyToShip,
        importantOrder,
        onHold,
        hidden,
        managerCreated,
        notificationSent,
        shouldSendNotification,
        transferAgentSent
      } = data;
      // get client name from battlefield if exists
      let client = [];
      if (client_info.length = 0) {
        client = await BattlefieldInfo.find({ invoiceNo: invoiceNo.trim() }).select('clientName').lean();
      } else {
        client.push(client_info);
      }
      // create priority order
      const createPriorityOrder = await PriorityInfo.create({
        paymentDate,
        invoiceNo,
        manager,
        whManager,
        packingDate,
        sendDate,
        logisticCom,
        delService,
        toxins,
        threads,
        managerCom,
        pckStarted,
        pckCompleted,
        docsReady,
        bookedPickup,
        readyToShip,
        importantOrder,
        onHold,
        hidden,
        notificationSent,
        shouldSendNotification,
        transferAgentSent,
        client_info: client[0]
      });
      // create changes history
      const impOrder = importantOrder == true ? 'Order was set as High Priority' : '';
      const historyData = {
        order_id: createPriorityOrder._id,
        manager: managerCreated,
        action: `Created this order ${impOrder}`
      };
      await ChangeInfo.create(historyData);
      if(transferAgentSent){
        let axiosConfig = {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        };
        axios
          .post(API_PATH, JSON.stringify(data), axiosConfig).then((res) => { console.log('RESPONSE RECEIVED: '); })
          .catch((err) => { console.log('AXIOS ERROR: ', err); });
      }
      const priority_orders = await getPriorityInfo();
      io.of('/priority').emit('get_priority', { priority_orders: priority_orders });
    } catch (err) {
      callback({ status: 'error', message: err.message }); // send error response to client
    }
  });
  socket.on('update_priority', async (data, callback) => {
    try {
      if (Array.isArray(data)) {
        for (const key of Object.keys(data)) {
          await PriorityInfo.findByIdAndUpdate(data[key]['_id'], data[key], { new: true });
        }
      } else {
        const { _id, pckCompleted, shouldSendNotification, readyToShip, notifyLocked } = data;
        const { order_id, manager, action, updated } = data.historyData;
        await PriorityInfo.findByIdAndUpdate(_id, data, { new: true });
        await ChangeInfo.create({ order_id, manager, action, updated });
        if((pckCompleted && shouldSendNotification) || readyToShip || notifyLocked){
          let axiosConfig = {
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              'Access-Control-Allow-Origin': '*'
            }
          };
          axios
            .post(API_PATH, JSON.stringify(data), axiosConfig).then((res) => { console.log('RESPONSE RECEIVED: ', res); })
            .catch((err) => { console.log('AXIOS ERROR: ', err); });
        }
      }
      const priority_orders = await getPriorityInfo();
      io.of('/priority').emit('get_priority', { priority_orders: priority_orders });
    } catch (err) {
      callback({ status: 'error', message: err.message }); // send error response to client
    }
  });
  socket.on('delete_priority', async (data) => {
    await PriorityInfo.findByIdAndRemove(data);
    const priority_orders = await getPriorityInfo();
    io.of('/priority').emit('get_priority', { priority_orders: priority_orders });
  });
}

export const getArchivePriorities = async (req, res) => {
  try {
    const priorityArchiveInfoResp = await PriorityInfo.find({ hidden: true })
    .select('_id paymentDate invoiceNo manager whManager packingDate sendDate logisticCom delService toxins threads managerCom pckStarted pckCompleted docsReady bookedPickup readyToShip importantOrder onHold hidden lockReason lockedBy toxThrPackaged completedOrder shouldSendNotification notificationSent createdAt client_info transferAgentSent')
    .sort({ paymentDate: 1 })
    // .limit(req.body.amount)
    .populate('manager', '_id fname sname bitrixID')
    .populate({
      path: 'whManager',
      select: '_id fname sname bitrixID',
      match: { _id: { $exists: true } }
    })
    .populate({
      path: 'lockedBy',
      select: '_id fname sname bitrixID',
      match: { _id: { $exists: true } }
    })
    .lean() // add this to make the result plain JavaScript objects
    .exec();
    const count = await PriorityInfo.countDocuments({ hidden: true });
    const combinedResp = [priorityArchiveInfoResp, count]
    res.status(200).json(combinedResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getHistory = async (req, res) => {
  try {
    const historyInfoResp = await ChangeInfo.find({ order_id: mongoose.Types.ObjectId(req.params['id']) })
    .select('_id order_id manager action updated createdAt updatedAt')
    .populate({
      path: 'order_id',
      select: '_id invoiceNo',
      match: { _id: { $exists: true } }
    })
    res.status(200).json(historyInfoResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
