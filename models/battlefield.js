import mongoose from 'mongoose';

const battlefieldSchema = mongoose.Schema({
  date: Date,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sender: {
    type: String,
    trim: true
  },
  clientName: {
    type: String,
    index: true,
    trim: true
  },
  newClient: {
    type: Boolean,
    default: false,
    index: true
  },
  invoiceNo: {
    type: String,
    index: true,
    trim: true
  },
  country: {
    type: String,
    index: true
  },
  region: {
    type: String,
    index: true
  },
  invoiceSum: {
    type: Number
  },
  paymentMethod: {
    type: String
  },
  comments: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    index: true
  },
  source: {
    type: String
  },
  amountReceived: {
    type: Number
  },
  currAmountReceived: {
    type: String,
    trim: true
  },
  orderStatus: {
    type: Boolean,
    default: false,
    index: true
  },
  receivedDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  year: {
    type: String,
    index: true
  },
  month: {
    type: String,
    index: true
  },
  notificationSent: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });
const BattlefieldInfo = mongoose.model('Battlefield', battlefieldSchema);

export default BattlefieldInfo;
