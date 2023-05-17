import mongoose from 'mongoose';

const depSchema = mongoose.Schema({
  depName: {
    type: String,
    index: true, // add index to depName
    trim: true 
  },
  departmentPic: String,
}, { timestamps: true });
const DepInfo = mongoose.model('Department', depSchema);

export default DepInfo;
