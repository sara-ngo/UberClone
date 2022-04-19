import mongoose from 'mongoose'

function connect(app) {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.MONGO_URI, connectionParams);
  } catch (error) {
    console.log(error);
    console.log("Could not connect database!");
  }
};

export default connect;
