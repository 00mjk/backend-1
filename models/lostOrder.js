import mongoose from 'mongoose';

const lostOrderSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  responsible: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  invoiceNo: {
    type: String,
    index: true,
    trim: true
  },
  information: {
    type: String,
    sparse: true,
    trim: true
  },
  sender: {
    type: String,
    sparse: true,
    trim: true
  },
  clientName: {
    type: String,
    sparse: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    sparse: true,
    trim: true
  },
  amountReceived: {
    type: Number,
    sparse: true
  },
  currAmountReceived: {
    type: String,
    sparse: true,
    trim: true
  },
  paymentStatus: {
    type: String,
    sparse: true,
    trim: true
  },
  status: {
    type: Boolean,
    sparse: true
  },
}, { timestamps: true });

const LostOrderInfo = mongoose.model('LostOrder', lostOrderSchema);

export default LostOrderInfo;
