import DepInfo from '../models/department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await DepInfo.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createDepartment = async (req, res, next) => {
  const { depName } = req.body;
  try {
    const newDepResp = await DepInfo.create({ depName });
    res.status(200).json(newDepResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res, next) => {
  const { _id } = req.body;
  try {
    const upDepResp = await DepInfo.findByIdAndUpdate(_id, req.body, { new: true });
    res.status(200).json(upDepResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res, next) => {
  const { id } = req.params;
  const delDepResp = await DepInfo.findByIdAndRemove(id);
  res.status(200).json(delDepResp);
};