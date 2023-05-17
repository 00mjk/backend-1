import mongoose from 'mongoose';

const accessSchema = mongoose.Schema({
  battlefieldAccess: Boolean,
  battlefieldBtnPeriodAccess: Boolean,
  battlefieldBtnNewOrderAccess: Boolean,

  priorityOrderAccess: Boolean,
  priorityHistoryBtnAccess: Boolean,
  priorityArchiveBtnAccess: Boolean,
  priorityCompletedBtnAccess: Boolean,
  priorityBtnNewOrderAccess: Boolean,

  customerServiceAccess: Boolean,
  customerServiceRspFldAccess: Boolean,

  shippingCalcAccess: Boolean,
  shippingTableEdit: Boolean,

  transferAgentAccess: Boolean,
  transferAgentTableEdit: Boolean,

  statisticsGenAccess: Boolean,
  statisticsSalesManAccess: Boolean,
  statisticsAnalAccess: Boolean,

  purchaseRqstdPrdAccess: Boolean,
  purchaseListAccess: Boolean,

  leavesOverallAccess: Boolean,
  leavesHolidaysAccess: Boolean,
});

const AccessInfo = mongoose.model('Access', accessSchema);

export default AccessInfo;