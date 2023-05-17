import CustomerServiceInfo from '../models/customerService.js';
import UserInfo from '../models/user.js';
import mongoose from 'mongoose';
import axios from 'axios';
const API_PATH = 'http://crystalfiller.com/newCustSupportNotificationScript/';

export const getCustomerService = async (req, res) => {
  try {
    const dep = '6110ee0090476f3ed00446f7'; // Sales Department
    const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
    const managersInfoResp = await UserInfo.find({
      $or: [
        { department: dep },
        { department: dep2 }
      ]
    }).select('_id fname sname bitrixID').sort({ fname: 1 });
    const customerServiceInfoResp = await CustomerServiceInfo.find({}).select('-__v')
      .populate({
        path: 'manager',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'orderTaker',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      });
    const combinedInforResp = [customerServiceInfoResp, managersInfoResp]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createCustomerService = async (req, res, next) => {
  const {
    date,
    manager,
    forwarder,
    tracking,
    description,
    respond,
    status,
    orderTaker,
    clientName,
    createdAt
  } = req.body;
  try {
    await CustomerServiceInfo.create({
      date,
      manager,
      forwarder,
      tracking,
      description,
      respond,
      status,
      orderTaker,
      clientName,
      createdAt
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

    const customerServiceInfoResp = await CustomerServiceInfo.find({}).select('-__v')
      .populate({
        path: 'manager',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'orderTaker',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      });
    res.status(200).json(customerServiceInfoResp[customerServiceInfoResp.length - 1]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateCustomerService = async (req, res, next) => {
  const { id: _id } = req.params;
  const custService = req.body;
  try {
    await CustomerServiceInfo.findByIdAndUpdate(_id, custService, { new: true });
    const customerServiceInfoResp = await CustomerServiceInfo.find({}).select('-__v')
      .populate({
        path: 'manager',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'orderTaker',
        select: 'fname sname',
        match: { _id: { $exists: true } }
      });
    
      res.status(200).json(customerServiceInfoResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteCustomerService = async (req, res, next) => {
  const { id } = req.params;
  const ServiceInForm = await CustomerServiceInfo.findById(id);
  await CustomerServiceInfo.findByIdAndRemove(id);
  res.status(200).json(ServiceInForm);
};
