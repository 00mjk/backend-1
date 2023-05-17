import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  date: {
    type: Date,
    default: null
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  client_info: {
    type: Object,
    default: {}
  },
  cNo: {
    type: String,
    index: true,
    trim: true
  },
  product: {
    type: String,
    trim: true
  },
  qty: Number,
  category: {
    type: String,
    index: true,
    trim: true
  },
  ead: {
    type: Date,
    default: null
  },
  comments: {
    type: String,
    trim: true
  },
  tracker: {
    type: String,
    trim: true
  },
  setAsOrdered: {
    type: Boolean,
    default: false
  },
  setAsArrived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const ProductInfo = mongoose.model('Product', productSchema);

export default ProductInfo;
