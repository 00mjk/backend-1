import mongoose from 'mongoose';

const customerServiceSchema = mongoose.Schema({
  date: {
    type: Date,
    sparse: true
  },
  manager: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  forwarder: {
    type: String,
    sparse: true,
    trim: true
  },
  tracking: {
    type: String,
    sparse: true,
    trim: true
  },
  description: {
    type: String,
    sparse: true,
    trim: true
  },
  respond: {
    type: String,
    sparse: true,
    trim: true
  },
  status: {
    type: String,
    sparse: true,
    trim: true
  },
  orderTaker: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  clientName: {
    type: String,
    sparse: true,
    trim: true
  }
}, { timestamps: true });;

const CustomerServiceInfo = mongoose.model('CustomerService', customerServiceSchema);

export default CustomerServiceInfo;
