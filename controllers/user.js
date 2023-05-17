import UserInfo from '../models/user.js';
import UserLeaveInfo from '../models/userLeave.js';
import AccessInfo from '../models/access.js';
import DepInfo from '../models/department.js';
import sendEmail from '../utils/sendEmail.js';

export const getUsers = async (req, res) => {
  try {
    //get users
    const usersInfoResp = await UserInfo.find()
    .populate('department', '-createdAt -__v')
    .populate('leave', '-__v')
    .populate('access', '-__v')
    .select('-__v').sort({ fname: 1 });
    //get departments
    const departments = await DepInfo.find();
    const combinedInforResp = [usersInfoResp, departments]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createUser = async (req, res, next) => {
  const {
    fname,
    sname,
    workEmail,
    persEmail,
    profilePic,
    password,
    department,
    supervisor,
    position,
    vacLeave,
    medLeave,
    vacLeaveHours,
    medLeaveHours,
    mobPhoneOne,
    mobPhoneTwo,
    deskPhone,
    country,
    accType,
    bitrixID
  } = req.body;
  try {
    const resp_leave = await UserLeaveInfo.create({
      vacLeave,
      medLeave,
      vacLeaveHours,
      medLeaveHours,
    });
    const resp_access = await AccessInfo.create({
      battlefieldAccess: false,
      battlefieldBtnPeriodAccess: false,
      battlefieldBtnNewOrderAccess: false,
    
      priorityOrderAccess: false,
      priorityHistoryBtnAccess: false,
      priorityArchiveBtnAccess: false,
      priorityCompletedBtnAccess: false,
      priorityBtnNewOrderAccess: false,
    
      customerServiceAccess: false,
      customerServiceRspFldAccess: false,
    
      shippingCalcAccess: false,
      shippingTableEdit: false,
    
      transferAgentAccess: false,
      transferAgentTableEdit: false,
    
      statisticsGenAccess: false,
      statisticsSalesManAccess: false,
      statisticsAnalAccess: false,
    
      purchaseRqstdPrdAccess: false,
      purchaseListAccess: false,
    
      leavesOverallAccess: false,
      leavesHolidaysAccess: false,
    });
    const resp_user = await UserInfo.create({
      fname,
      sname,
      workEmail,
      persEmail,
      profilePic,
      password,
      supervisor,
      position,
      mobPhoneOne,
      mobPhoneTwo,
      deskPhone,
      country,
      accType,
      bitrixID,
      department,
      leave: resp_leave._id,
      access: resp_access._id,
    });
    const newUserResp = await UserInfo.find({_id: resp_user._id})
    .populate('department', '-createdAt -__v')
    .populate('leave', '-__v')
    .populate('access', '-__v')
    .select('-__v').sort({ fname: 1 });
    res.status(200).json(newUserResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateUser = async (req, res, next) => {
  const { leave_id, access_id, option } = req.body;
  const user_id = req.body._id;
  try {
    // let upUserResp = [];
    if(option === 'update_user'){
      await UserInfo.findByIdAndUpdate(user_id, req.body, { new: true });
      delete req.body._id;
      await UserLeaveInfo.findByIdAndUpdate(leave_id, req.body, { new: true });
    } else if(option === 'update_access'){
      delete req.body._id;
      await AccessInfo.findByIdAndUpdate(access_id, req.body, { new: true });
    }
    const upUserResp = await UserInfo.find({_id: user_id})
    .populate('department', '-createdAt -__v')
    .populate('leave', '-__v')
    .populate('access', '-__v')
    .select('-__v').sort({ fname: 1 });
    res.status(200).json(upUserResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const delUserResp = await UserInfo.findByIdAndRemove(id);
  await UserLeaveInfo.deleteOne({ _id: delUserResp.leave });
  await AccessInfo.deleteOne({ _id: delUserResp.access });
  res.status(200).json(delUserResp);
};