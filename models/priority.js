import mongoose from 'mongoose';

const prioritySchema = mongoose.Schema({
  paymentDate: Date,
  invoiceNo: { 
    type: String, 
    index: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  client_info: mongoose.Schema.Types.Mixed,
  whManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  packingDate:  { 
    type: String,
    trim: true
  },
  sendDate:  { 
    type: String,
    trim: true
  },
  logisticCom:  { 
    type: String,
    trim: true
  },
  delService:  { 
    type: String,
    trim: true
  },
  managerCom:  { 
    type: String,
    trim: true
  },
  toxins: Boolean,
  threads: Boolean,
  toxThrPackaged: Boolean,
  pckStarted: Boolean,
  pckCompleted: Boolean,
  docsReady: Boolean,
  bookedPickup: Boolean,
  readyToShip: Boolean,
  completedOrder: Boolean,
  importantOrder: Boolean,
  onHold: Boolean,
  hidden: Boolean,
  notificationSent: Boolean,
  shouldSendNotification: Boolean,
  transferAgentSent: Boolean,
  lockReason:  { 
    type: String,
    trim: true
  },
  lockedBy: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
}, { timestamps: true });

const PriorityInfo = mongoose.model('Priority', prioritySchema);

export default PriorityInfo;
