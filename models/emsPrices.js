import mongoose from 'mongoose';

const emsPricesSchema = mongoose.Schema({
  country: { type: String, index: true },
  netWeightEms: { type: Number, index: true },
  priceAmountEms: { type: Number, index: true },
});

const emsPricesInfo = mongoose.model('EmsPrices', emsPricesSchema);

export default emsPricesInfo;
