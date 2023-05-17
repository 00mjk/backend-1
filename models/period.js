import mongoose from 'mongoose';

const periodSchema = mongoose.Schema({
  startDate: Date,
  year: String,
  month: String,
  endDate: Date,
  periodNo: String,
});

const PeriodInfo = mongoose.model('Period', periodSchema);

export default PeriodInfo;
