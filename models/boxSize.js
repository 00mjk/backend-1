import mongoose from 'mongoose';

const boxSizeSchema = mongoose.Schema({
  boxSizeNo: { type: Number, index: true },
  width: Number,
  length: Number,
  height: Number,
  volWeight: Number,
});

const boxSizeInfo = mongoose.model('BoxSize', boxSizeSchema);

export default boxSizeInfo;
