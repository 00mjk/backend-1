import mongoose from 'mongoose';

const agentSchema = mongoose.Schema({
  mainName: {
    type: String,
    trim: true,
    index: true
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  commentsAddress: {
    type: String,
    trim: true
  },
  onVacation: {
    type: Boolean,
    default: false,
    index: true,
  },
  onPause: {
    type: Boolean,
    default: false,
  },
  orderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
}, { timestamps: true });

const AgentInfo = mongoose.model('Agent', agentSchema);

export default AgentInfo;
