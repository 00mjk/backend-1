import mongoose from 'mongoose';

const countryTrSchema = mongoose.Schema({
  country: { type: String, index: true },
  weight: { type: Number },
  price: { type: Number },
  days: { type: Number }
});

const countriesTrInfo = mongoose.model('CountryTr', countryTrSchema);

export default countriesTrInfo;
