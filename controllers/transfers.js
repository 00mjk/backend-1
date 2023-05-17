import transferInfo from '../models/transfer.js';
import agentInfo from '../models/agent.js';
import agentFeeInfo from '../models/agentFee.js';
import boxSizeInfo from '../models/boxSize.js';
import UserInfo from '../models/user.js';
import schedule from 'node-schedule';
import axios from 'axios';

const API_PATH = 'http://crystalfiller.com/newCustSupportNotificationScript/';
async function getTransferInfo() {
  // get transfers info
  const transferInfoResp = await transferInfo
    .find()
    .select()
    .populate({
      path: 'manager',
      select: 'fname sname workEmail bitrixID _id',
      match: { _id: { $exists: true } }
    })
    .populate({
      path: 'agent',
      select: 'mainName name address phone _id',
      match: { _id: { $exists: true } }
    })
    .select({
      invoiceNo: 1,
      clientName: 1,
      trackingFromKorea: 1,
      boxSize: 1,
      weight: 1,
      dpdSize: 1,
      clientPayment: 1,
      customFees: 1,
      senderType: 1,
      toxins: 1,
      address: 1,
      comments: 1,
      manager: 1,
      toxins: 1,
      address: 1,
      comments: 1,
      agent: 1,
      agentPaymentAmount: 1,
      agentPaid: 1,
      status: 1,
      completed: 1,
      problem: 1,
      workNeeded: 1,
      currentlyWorking: 1,
      workDone: 1,
      searchInv: {
        $concat: ['$clientName', ' ', '$invoiceNo']
      }
    });
  if (transferInfoResp.length === 0) {
    transferInfoResp.push({ manager: 'No Results Found' });
  }
  // get agents info
  const agentInfoResp = await agentInfo
    .find({ onVacation: false })
    .select(
      'orderAmount paymentAmount mainName name address phone commentsAddress onVacation onPause'
    );
  if (agentInfoResp.length === 0) {
    agentInfoResp.push({ manager: 'No Results Found' });
  }
  // get agent fee
  const agentFeeInfoResp = await agentFeeInfo
    .find()
    .select('boxSize weightKG agentFee')
    .sort({ boxSize: 1 });
  // get box sizes
  const boxSizeInfoResp = await boxSizeInfo
    .find()
    .select('boxSizeNo width length height volWeight')
    .sort({ boxSizeNo: 1 });
  //get managers
  const dep = '6110ee0090476f3ed00446f7'; // Sales Department
  const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
  const managersInfoResp = await UserInfo.find({
    $or: [{ department: dep }, { department: dep2 }]
  })
    .select('_id fname sname bitrixID')
    .sort({ fname: 1 });
  return [transferInfoResp, agentInfoResp, agentFeeInfoResp, boxSizeInfoResp, managersInfoResp];
}
export async function transfers(socket, io) {
  const transfers = await getTransferInfo();
  io.of('/transfers').emit('get_transfers', { transfers: transfers });
  socket.on('add_transfer', async (data) => {
    console.log('create tr');
    const {
      invoiceNo,
      clientName,
      trackingFromKorea,
      boxSize,
      weight,
      dpdSize,
      clientPayment,
      customFees,
      senderType,
      manager,
      toxins,
      address,
      comments,
      agent,
      agentPaymentAmount,
      agentPaid,
      status,
      completed,
      problem,
      workNeeded,
      currentlyWorking,
      workDone
    } = data;
    await transferInfo.create({
      invoiceNo,
      clientName,
      trackingFromKorea,
      boxSize,
      weight,
      dpdSize,
      clientPayment,
      customFees,
      senderType,
      manager,
      toxins,
      address,
      comments,
      agent,
      agentPaymentAmount,
      agentPaid,
      status,
      completed,
      problem,
      workNeeded,
      currentlyWorking,
      workDone
    });

    const transfers = await getTransferInfo();
    io.of('/transfers').emit('get_transfers', { transfers: transfers });
  });
  socket.on('update_transfer', async (data) => {
    const { _id, sendNotification } = data;
    if (Array.isArray(data)) {
      for (const key of Object.keys(data)) {
        await transferInfo.findByIdAndUpdate(data[key]['_id'], data[key], { new: true });
      }
    } else {
      await transferInfo.findByIdAndUpdate(_id, data, { new: true });
    }
    if(sendNotification){
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      };
      axios
        .post(API_PATH, JSON.stringify(data), axiosConfig).then((res) => { console.log('RESPONSE RECEIVED: '+ res); })
        .catch((err) => { console.log('AXIOS ERROR: ', err); });
    }
    const transfers = await getTransferInfo();
    io.of('/transfers').emit('get_transfers', { transfers: transfers });
  });
  socket.on('delete_transfer', async (data) => {
    const { _id, agent, agentPaymentAmount } = data;
    await transferInfo.findByIdAndRemove(_id);
    await agentInfo.updateOne({ _id: agent._id }, { $inc: { orderAmount: -1 } });
    await agentInfo.updateMany(
      { mainName: agent.mainName },
      { $inc: { paymentAmount: -agentPaymentAmount } }
    );
    const transfers = await getTransferInfo();
    io.of('/transfers').emit('get_transfers', { transfers: transfers });
  });
}

async function getAgentsInfo() {
  // get agents info
  const agentInfoResp = await agentInfo
    .find()
    .select(
      'orderAmount paymentAmount mainName name address phone commentsAddress onVacation onPause'
    );
  // get agent fee
  const agentFeeInfoResp = await agentFeeInfo
    .find()
    .select('boxSize weightKG agentFee')
    .sort({ boxSize: 1 });
  return [agentInfoResp, agentFeeInfoResp];
}
export async function agents(socket, io) {
  const agents = await getAgentsInfo();
  io.of('/transfers').emit('get_agents', { agents: agents });

  socket.on('add_agent', async (data) => {
    const { mainName, name, address, phone, commentsAddress } = data;
    await agentInfo.create({
      mainName,
      name,
      address,
      phone,
      commentsAddress
    });
    const transfers = await getTransferInfo();
    io.of('/transfers').emit('get_transfers', { transfers: transfers });
  });
  socket.on('update_agent', async (data) => {
    const { _id } = data;
    await agentInfo.findByIdAndUpdate(_id, data, { new: true });
    const agents = await getAgentsInfo();
    io.of('/transfers').emit('get_agents', { agents: agents });
  });
  socket.on('delete_agent', async (data) => {
    await agentInfo.findByIdAndRemove(data);
    const agents = await getAgentsInfo();
    io.of('/transfers').emit('get_agents', { agents: agents });
  });
}

const globalResetAgentJob = schedule.scheduleJob('0 0 1 * *', async () => {
  await agentInfo.updateMany({}, { $set: { orderAmount: 0, paymentAmount: 0 } }, { multi: true });
});
