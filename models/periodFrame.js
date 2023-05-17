import mongoose from 'mongoose';

const periodFrameSchema = mongoose.Schema({
  periodNo: {
    type: String,
    index: true
  },
  monthSt: String,
  monthEnd: String
});

const PeriodFrameInfo = mongoose.model('PeriodFrame', periodFrameSchema);

export default PeriodFrameInfo;
