import mongoose from 'mongoose';

const connectDB = async() => {
    mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
  },
  (err)=>{
    if(!err){
      console.log("Mongo DB connected");
    }
    else{
      console.log(err)
    }
  }
  );
}

export default connectDB;