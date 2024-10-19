import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_DB_URI as string;
    if (!dbURI) {
      throw new Error('MONGO_DB_URI is not defined in environment variables');
    }
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;