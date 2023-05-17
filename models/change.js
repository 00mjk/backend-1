import mongoose from 'mongoose';

const changeSchema = mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Priority'
  },
  manager: {
    type: String,
    trim: true
  },
  action: {
    type: String,
    trim: true
  },
  updated: {
    type: String,
    trim: true
  },
}, { timestamps: true });

const changeInfo = mongoose.model('Change', changeSchema);

export default changeInfo;
