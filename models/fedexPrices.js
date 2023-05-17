import mongoose from 'mongoose';

const fedexPricesSchema = mongoose.Schema({
  country: { type: String, index: true },
  netWeightFedex: { type: Number, index: true },
  priceAmountFedex: { type: Number, index: true }
});

const fedexPricesInfo = mongoose.model('FedexPrices', fedexPricesSchema);

export default fedexPricesInfo;
