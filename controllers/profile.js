import mongoose from 'mongoose';
// import schedule from 'node-schedule';

import ErrorResponse from '../utils/errorResponse.js';
import UserInfo from '../models/user.js';

export const updateUserData = async (req, res, next) => {
  const { id: id } = req.params;
  const user = req.body;
  try {
    await UserInfo.findByIdAndUpdate(id, user, { new: true });
    const userInfoResp = await UserInfo.findOne({ workEmail: user.workEmail })
    .populate('department', '-createdAt -_id -__v')
    .populate('leave', '-_id -__v')
    .populate('access', '-_id -__v')
    .select('-password -resetPasswordToken -resetPasswordExpire');

    res.status(200).json(userInfoResp);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
export const updatePhoto = async (req, res, next) => {
  const { id: _id } = req.params;
  const employee = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return next(new ErrorResponse('User with that id doesnt exist', 400));
    await UserInfo.findByIdAndUpdate(
      _id,
      {
        $set: {
          profilePic: employee.file
        }
      },
      { new: true }
    );
    const userInfoResp = await UserInfo.findOne({ workEmail: employee.workEmail })
    .populate('department', '-createdAt -_id -__v')
    .populate('leave', '-_id -__v')
    .populate('access', '-_id -__v')
    .select('-password -resetPasswordToken -resetPasswordExpire');
    res.status(200).json(userInfoResp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const editPassword = async (req, res, next) => {
  const { workEmail, currentPwd, newPwd, confPwd } = req.body;
  try {
    const existingUser = await UserInfo.findOne({ workEmail }).select('+password');
    const isPasswordCorrect = await existingUser.matchPasswords(currentPwd);
    if (!isPasswordCorrect) return next(new ErrorResponse('Current Password is incorrect', 400));
    if (newPwd !== confPwd) return next(new ErrorResponse('Passwords do not match', 401));
    if (newPwd.length < 6)
      return next(
        new ErrorResponse('Password is too short. It should be not less than 6 characters!', 404)
      );
    existingUser.password = newPwd;
    await existingUser.save();
    res.status(201).json({ success: true, data: 'Password Changed Successfully ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//   const { id: _id } = req.params;
//   const employee = req.body;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(_id))
//       return next(new ErrorResponse('User with that id doesnt exist', 400));
//     await UserInfo.findByIdAndUpdate(
//       _id,
//       {
//         $set: {
//           usedImpOrder: employee.usedImpOrder
//         }
//       },
//       { new: true }
//     );
//     // await UserInfo.updateMany({}, { $set: { usedImpOrder: false } }, { multi: true });
//     res.status(200).json('success');
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
  
// const globalResetJob = schedule.scheduleJob('00 05 * * *', async () => {
//   await UserInfo.updateMany({}, { $set: { usedImpOrder: false } }, { multi: true });
// });