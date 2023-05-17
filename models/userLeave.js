import mongoose from 'mongoose';

const userLeaveSchema = mongoose.Schema({
  vacLeave: {
    type: Number,
    min: 0,
    integer: true
  },
  vacLeaveHours: {
    type: Number,
    min: 0,
    integer: true
  },
  medLeave: {
    type: Number,
    min: 0,
    integer: true
  },
  medLeaveHours: {
    type: Number,
    min: 0,
    integer: true
  }
});

const UserLeaveInfo = mongoose.model('UserLeave', userLeaveSchema);

export default UserLeaveInfo;