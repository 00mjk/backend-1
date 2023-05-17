import mongoose from 'mongoose';

const purchaseSchema = mongoose.Schema({
  cNo: {
    type: String,
    index: true,
    trim: true
  },
  ead: {
    type: Date,
    default: null
  },
  products: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'Product'
  }],
  selfProducts: {
    type: Object,
    default: {}
  },
  qty: {
    type: Object,
    default: {}
  },
  managers: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }],
  all: {
    type: Boolean,
    default: false
  },
  tracker: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true
  },
  arrived: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const PurchaseInfo = mongoose.model('Purchase', purchaseSchema);

export default PurchaseInfo;
