import mongoose from 'mongoose';

const transferSchema = mongoose.Schema({
  invoiceNo: { type: String, trim: true, index: true },
  clientName: { type: String, trim: true },
  trackingFromKorea: { type: String, trim: true },
  boxSize: {
    type: Number,
    default: 0,
    min: 0
  },
  weight: {
    type: Number,
    default: 0,
    min: 0
  },
  dpdSize: String,
  clientPayment: Number,
  customFees: Number,
  senderType: { type: String, trim: true },
  manager: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  toxins: Boolean,
  address: { type: String, trim: true },
  comments: String,
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  agentPaymentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  agentPaid: Boolean,

  completed: Boolean,
  problem: Boolean,
  workNeeded: Boolean,
  currentlyWorking: Boolean,
  workDone: Boolean,
}, { timestamps: true });

const TransferInfo = mongoose.model('Transfer', transferSchema);

export default TransferInfo;
