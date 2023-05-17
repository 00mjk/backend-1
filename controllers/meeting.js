import meetingInfo from '../models/meeting.js';
import UserInfo from '../models/user.js';
import DepInfo from '../models/department.js';
import schedule from 'node-schedule';
import axios from 'axios';
const API_PATH = 'http://crystalfiller.com/sendNotificationScriptMeeting/';

export const getMeetingsInfo = async (req, res) => {
  try {
    const meetingsInfoResp = await meetingInfo.find()
      .populate({
        path: 'bookedBy',
        select: '_id fname sname workEmail'
      })
      .select('_id title bookedBy start end className participants sendReminder')

    const departments = await DepInfo.find().select('depName').sort({ depName: 1 });
    const users = await UserInfo.find()
      .populate('department', 'depName')
      .select('_id fname sname workEmail bitrixID').sort({ workEmail: 1 });

    const combinedInforResp = [meetingsInfoResp, users, departments]
    res.status(200).json(combinedInforResp);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createMeeting = async (req, res, next) => {
  const { title, bookedBy, start, end, participants, sendReminder, className } = req.body;
  try {
    const resp_meet = await meetingInfo.create({
      title,
      bookedBy,
      start,
      end,
      participants,
      sendReminder,
      className
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

    const newMeetResp = await meetingInfo.find({_id: resp_meet._id})
      .populate({
        path: 'bookedBy',
        select: '_id fname sname workEmail'
      })
      .select('_id title bookedBy start end className participants sendReminder')
    res.status(200).json(newMeetResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateMeeting = async (req, res, next) => {
  const { _id } = req.body;
  try {
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
    await meetingInfo.findByIdAndUpdate(_id, req.body, { new: true });
    const upMeetResp = await meetingInfo.find({_id: _id})
    .populate({
      path: 'bookedBy',
      select: '_id fname sname workEmail'
    })
    .select('_id title bookedBy start end className participants sendReminder')
    res.status(200).json(upMeetResp[0]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteMeeting = async (req, res, next) => {
  const { id } = req.params;
  const delMeetResp = await meetingInfo.findByIdAndRemove(id);
  res.status(200).json(delMeetResp);
};

const globalResetJob = schedule.scheduleJob('*/10 * * * *', async () => {
  try{
  let dateTest1 = new Date().toLocaleDateString('fr-CA') + 'T00:00:00.000Z';
  let dateTest2 = new Date();
  dateTest2.setDate(dateTest2.getDate() + 1);
  dateTest2 = dateTest2.toLocaleDateString('fr-CA') + 'T00:00:00.000Z';

  const meetingsInfoResp = await meetingInfo.find({
    $and: [
      { start: { $gte: dateTest1, $lt: dateTest2 } },
      { sendReminder: true }
    ]
  })
    .populate({
      path: 'bookedBy',
      select: 'fname sname'
    })
    .select('_id title start end className participants sendReminder bookedBy');
  let curTime = new Date(); // for now

  for (let i = 0; i < meetingsInfoResp.length; i++) {
    let difference = Math.floor(
      (new Date(meetingsInfoResp[i]['start']).getTime() - curTime.getTime()) / 1000 / 60
    );

    if (difference == 9) {
      meetingsInfoResp[i]['status'] = 'send reminder';
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      };
      const info = JSON.stringify(meetingsInfoResp[i]);
      axios
        .post(API_PATH, info, axiosConfig)
        .then((res) => {
          console.log('RESPONSE RECEIVED: ', res);
        })
        .catch((err) => {
          console.log('AXIOS ERROR: ', err);
        });
    }
  }
}
  catch(err){

  }
});
