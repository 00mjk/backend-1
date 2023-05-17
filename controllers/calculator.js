import destinationInfo from '../models/destination.js';
import countryTrInfo from '../models/countryTr.js';
import fedexPricesInfo from '../models/fedexPrices.js';
import emsPricesInfo from '../models/emsPrices.js';
import agentFeeInfo from '../models/agentFee.js';
import boxSizeInfo from '../models/boxSize.js';
import agentInfo from '../models/agent.js';

export const getShippingInfo = async (req, res) => {
  try {
    const destinationInfoResp = await destinationInfo.find().select();
    const countriesTrInfoResp = await countryTrInfo.find().select();
    const fedexPricesInfoResp = await fedexPricesInfo
      .find()
      .select()
      .sort({ priceAmountFedex: 1 });
    const emsPricesInfoResp = await emsPricesInfo
      .find()
      .select()
      .sort({ netWeightEms: 1 });
    const agentInfoResp = await agentInfo
      .find({ onVacation: false })
      .select()
      .sort({ mainName: 1 });
    const agentFeeInfoResp = await agentFeeInfo
      .find()
      .select()
      .sort({ boxSize: 1 });
    const boxSizesInfoResp = await boxSizeInfo
      .find()
      .select()
      .sort({ boxSizeNo: 1 });
    const combinedInforResp = [
      destinationInfoResp,
      fedexPricesInfoResp,
      emsPricesInfoResp,
      agentInfoResp,
      agentFeeInfoResp,
      boxSizesInfoResp,
      countriesTrInfoResp
    ]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createBoxSize = async (req, res, next) => {
  const { boxSizeNo, width, length, height, volWeight } = req.body;
  try {
    const newBoxSizeResp = await boxSizeInfo.create({
      boxSizeNo,
      width,
      length,
      height,
      volWeight
    });
    res.status(200).json(newBoxSizeResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const updateBoxSize = async (req, res, next) => {
  const { _id } = req.body;
  try {
    const upBoxSizeResp = await boxSizeInfo.findByIdAndUpdate(_id, data, { new: true });
    res.status(200).json(upBoxSizeResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const deleteBoxSize = async (req, res, next) => {
  const { id } = req.params;
  const delBoxSizeResp = await boxSizeInfo.findByIdAndRemove(id);
  res.status(200).json(delBoxSizeResp);
};

export const createPrice = async (req, res, next) => {
  const { country, netWeight, priceAmount, priceType } = req.body;
  try {
    let newPriceResp = [];
    if (priceType === 'fedex') {
      newPriceResp = await fedexPricesInfo.create({
        country,
        netWeightFedex: netWeight,
        priceAmountFedex: priceAmount
      });
    } else {
      newPriceResp = await emsPricesInfo.create({
        country,
        netWeightEms: netWeight,
        priceAmountEms: priceAmount
      });
    }
    res.status(200).json(newPriceResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const updatePrice = async (req, res, next) => {
  const { _id, country, netWeight, priceAmount, priceType } = req.body;
  try {
    let upPriceResp = [];
    if (priceType === 'fedex') {
      upPriceResp = await fedexPricesInfo.findByIdAndUpdate(
        _id,
        { country, netWeightFedex: netWeight, priceAmountFedex: priceAmount },
        { new: true }
      );
    } else {
      upPriceResp = await emsPricesInfo.findByIdAndUpdate(
        _id,
        { country, netWeightEms: netWeight, priceAmountEms: priceAmount },
        { new: true }
      );
    }
    res.status(200).json(upBoxSizeResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const deletePrice = async (req, res, next) => {
  const { id } = req.params;
  const delBoxSizeResp = await boxSizeInfo.findByIdAndRemove(id);
  res.status(200).json(delBoxSizeResp);
};

export const importCountries = async (req, res, next) => {
  try {
    for (const key of Object.keys(data)) {
      const { country, weight, price, days } = data[key];
      await countryTrInfo.create({
        country,
        weight,
        price,
        days
      });
    }
    res.status(200).json('imported');
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};