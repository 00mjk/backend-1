import mongoose from 'mongoose';

const agentFeeSchema = mongoose.Schema({
  boxSize: { type: Number, index: true },
  weightKG: Number,
  agentFee: Number,
});

const agentFeeInfo = mongoose.model('AgentFee', agentFeeSchema);

export default agentFeeInfo;
