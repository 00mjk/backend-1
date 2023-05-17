import mongoose from 'mongoose';

const meeting = mongoose.Schema({
  title: {
    type: String,
    index: true,
    trim: true
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  start: String,
  end: String,
  participants: Object,
  className: String,
  sendReminder: Boolean,
}, { timestamps: true });

const meetingInfo = mongoose.model('Meeting', meeting);

export default meetingInfo;
