// import purchaseOrderInfo from '../models/purchaseOrder.js';
import ProductInfo from '../models/product.js';
import PurchaseInfo from '../models/purchase.js';
import BattlefieldInfo from '../models/battlefield.js';
import UserInfo from '../models/user.js';

import schedule from 'node-schedule';
import axios from 'axios';
// import exec from 'child_process';
const API_PATH = 'http://crystalfiller.com/newPurchasesNotificationScript/';

export const getPurchasesInfo = async (req, res) => {
  try {
    // get purchases list
    const purchasesListInfoResp = await PurchaseInfo.find({ hidden: false })
      .populate({
        path: 'managers',
        select: '_id fname sname bitrixID',
        match: { _id: { $exists: true } },
      })
      .populate({
        path: 'products',
        select: '_id product',
        match: { _id: { $exists: true } },
      })
    //get products list
    const productsInfoResp = await ProductInfo.find({ setAsArrived: false })
    .populate({
      path: 'manager',
      select: 'fname sname bitrixID'
    }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
    //get requested products
    const productsToOrderInfoResp = await ProductInfo.find({ setAsOrdered: false })
    .populate({
      path: 'manager',
      select: 'fname sname bitrixID'
    }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
    //get managers
    const dep = '6110ee0090476f3ed00446f7'; // Sales Department
    const dep2 = '61c931adb1937f0023a159b9'; // Business Management Team
    const managersInfoResp = await UserInfo.find({
      $or: [
        { department: dep },
        { department: dep2 }
      ]
    }).select('_id fname sname bitrixID').sort({ fname: 1 });
    const combinedInforResp = [
      purchasesListInfoResp,
      productsInfoResp,
      productsToOrderInfoResp,
      managersInfoResp
    ]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res, next) => {
  const { 
    date,
    manager,
    cNo,
    product,
    qty,
    category,
    comments,
    setAsOrdered,
    setAsArrived,
    page
  } = req.body;
  try {
    const clientInfo = await BattlefieldInfo.find(
      { invoiceNo: cNo.trim() },
      { clientName: 1 }
    );
    const resp_product = await ProductInfo.create({
      date,
      manager,
      client_info: clientInfo[0],
      cNo,
      product,
      qty,
      category,
      comments,
      setAsOrdered,
      setAsArrived
    });
    if (page == 'addProducts0') {
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
    }
    const newProdResp = await ProductInfo.find({ _id: resp_product._id })
    .populate({
      path: 'manager',
      select: 'fname sname bitrixID'
    }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
    res.status(200).json(newProdResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const updateProduct = async (req, res, next) => {
  const { _id, cNo } = req.body;
  try {
    const clientInfo = await BattlefieldInfo.find(
      { invoiceNo: cNo.trim() },
      { clientName: 1 }
    );
    req.body.client_info = clientInfo[0];
    await ProductInfo.findByIdAndUpdate(_id, req.body, { new: true });
    const upProducrResp = await ProductInfo.find({ _id: _id })
    .populate({
      path: 'manager',
      select: 'fname sname bitrixID'
    }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
    res.status(200).json(upProducrResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  await ProductInfo.deleteMany({ cNo: id });
  res.status(200).json({_id:id});
};


export const createPurchase = async (req, res, next) => {
  const { cNo, ead, products, selfProducts, qty, managers, all, category, tracker, comments, arrived, hidden } = req.body;
  try {
    const resp_purchase = await PurchaseInfo.create({
      cNo,
      ead,
      products,
      selfProducts,
      qty,
      managers,
      category,
      tracker,
      all,
      arrived,
      hidden,
      comments
    });
    if(products.length !== 0){
      for (let i = 0; i < products.length; i++) {
        await ProductInfo.findByIdAndUpdate(products[i], { setAsOrdered: true }, { new: true });
      }
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
    }
    const newPurResp = await PurchaseInfo.find({ _id: resp_purchase._id })
      .populate({
        path: 'managers',
        select: '_id fname sname bitrixID',
        match: { _id: { $exists: true } },
      })
      .populate({
        path: 'products',
        select: '_id product',
        match: { _id: { $exists: true } },
      })
    //get requested products
    const productsToOrderInfoResp = await ProductInfo.find({ setAsOrdered: false })
    .populate({
      path: 'manager',
      select: 'fname sname bitrixID'
    }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
    const NewCombinedResp = [
      newPurResp[0],
      productsToOrderInfoResp
    ]
    res.status(200).json(NewCombinedResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const updatePurchase = async (req, res, next) => {
  const { _id, productsList, ead, tracker, comments, arrived, page } = req.body;
  try {
    await PurchaseInfo.findByIdAndUpdate(_id, req.body, { new: true });
    if(page === 'purchaseRequestEdit' || (page === 'productsArrived' && arrived === true)){
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
    }
    if(productsList && productsList.length !== 0){
      for (let i = 0; i < productsList.length; i++) {
        await ProductInfo.findByIdAndUpdate(productsList[i]['_id'], { ead: ead, tracker: tracker, comments: comments, setAsArrived: arrived }, { new: true });
      }
    }
    const upPurResp = await PurchaseInfo.find({ _id: _id })
      .populate({
        path: 'managers',
        select: '_id fname sname bitrixID',
        match: { _id: { $exists: true } },
      })
      .populate({
        path: 'products',
        select: '_id product',
        match: { _id: { $exists: true } },
      })
    res.status(200).json(upPurResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const deletePurchase = async (req, res, next) => {
  const { id } = req.params;
  const { products } = req.body;
  const delPurResp = await PurchaseInfo.findByIdAndRemove(id);
  if(products.length !== 0){
    for (let i = 0; i < products.length; i++) {
      await ProductInfo.findByIdAndUpdate(products[i]['_id'], { setAsOrdered: false }, { new: true });
    }
  }
  //get requested products
  const productsToOrderInfoResp = await ProductInfo.find({ setAsOrdered: false })
  .populate({
    path: 'manager',
    select: 'fname sname bitrixID'
  }).select('createdAt cNo manager date product qty ead tracker category comments client_info setAsOrdered setAsArrived');
  const DelCombinedResp = [
    delPurResp,
    productsToOrderInfoResp
  ]
  res.status(200).json(DelCombinedResp);
};

export const getArrivedPurchases = async (req, res) => {
  try {
    // const periodDate = req.body;
    // let battlefieldInfoResp = null;
    // get purchases list
    const purchasesListInfoResp = await PurchaseInfo.find({ hidden: true })
    .sort({ _id: -1 })
    .limit(30)
    .populate({
      path: 'managers',
      select: '_id fname sname bitrixID',
      match: { _id: { $exists: true } },
    })
    .populate({
      path: 'products',
      select: '_id product',
      match: { _id: { $exists: true } },
    })
    // if (battlefieldInfoResp.length === 0) {
    //   battlefieldInfoResp.push({ manager: 'No Results Found' });
    // }
    res.status(200).json(purchasesListInfoResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
