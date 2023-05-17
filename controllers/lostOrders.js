import LostOrderInfo from '../models/lostOrder.js';
import UserInfo from '../models/user.js';
import PeriodInfo from '../models/period.js';

import mongoose from 'mongoose';
import axios from 'axios';
const API_PATH = 'http://crystalfiller.com/newLostOrderNotificationScript/';

export const getLostOrdersInfo = async (req, res) => {
  try {
    const periodDate = await PeriodInfo.find();
    const dep = '6110ee0090476f3ed00446f7'; // Sales Department
    const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
    const managersInfoResp = await UserInfo.find({
      $or: [
        { department: dep },
        { department: dep2 }
      ]
    }).select('_id fname sname bitrixID').sort({ fname: 1 });
    const today = new Date();
    const priorDate = new Date(new Date().setDate(today.getDate() - 20));
    const lostOrdersInfoResp = await LostOrderInfo.find({
      date: {
        $gte: priorDate,
        $lt: today
      }
    }).select('-__v')
      .populate({
        path: 'responsible',
        select: 'fname sname profilePic',
        match: { _id: { $exists: true } }
      });

    if (lostOrdersInfoResp.length === 0) {
      lostOrdersInfoResp.push({ manager: 'No Results Found' });
    }
    const combinedInforResp = [periodDate[0], lostOrdersInfoResp, managersInfoResp]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createLostOrder = async (req, res, next) => {
  const {
    date,
    description,
    responsible,
    invoiceNo,
    information,
    sender,
    clientName,
    paymentMethod,
    amountReceived,
    currAmountReceived,
    paymentStatus,
    status
  } = req.body;
  try {
    const resp_lostOrder = await LostOrderInfo.create({
      date,
      description,
      responsible: responsible != '' ? mongoose.Types.ObjectId(responsible) : responsible,
      invoiceNo,
      information,
      sender,
      clientName,
      paymentMethod,
      amountReceived,
      currAmountReceived,
      paymentStatus,
      status
    });
    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    };
    const info = JSON.stringify(req.body);
    axios
      .post(API_PATH, info, axiosConfig)
      .then((res) => {
        console.log('RESPONSE RECEIVED: ', res);
      })
      .catch((err) => {
        console.log('AXIOS ERROR: ', err);
      });
    const newLostOrderResp = await LostOrderInfo.find({ _id: resp_lostOrder._id }).select('-__v')
      .populate({
        path: 'responsible',
        select: 'fname sname profilePic',
        match: { _id: { $exists: true } }
      });
    res.status(200).json(newLostOrderResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateLostOrder = async (req, res, next) => {
  const { _id } = req.body;
  try {
    await LostOrderInfo.findByIdAndUpdate(_id, req.body, { new: true });
    const upLostOrderResp = await LostOrderInfo.find({ _id: _id }).select('-__v')
      .populate({
        path: 'responsible',
        select: 'fname sname profilePic',
        match: { _id: { $exists: true } }
      });
    res.status(200).json(upLostOrderResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteLostOrder = async (req, res, next) => {
  const { id } = req.params;
  const delLostOrderResp = await LostOrderInfo.findByIdAndRemove(id);
  res.status(200).json(delLostOrderResp);
};