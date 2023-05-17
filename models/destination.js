import mongoose from 'mongoose';

const destinationSchema = mongoose.Schema({
  box: { type: Number, index: true },
  countryFrom: { type: String, index: true },
  countryTo: { type: String, index: true },
  cheapPr: Number,
  expPr: Number
});

const destinationInfo = mongoose.model('Destination', destinationSchema);

export default destinationInfo;
