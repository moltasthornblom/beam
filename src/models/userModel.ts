import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the User document
interface IUser extends Document {
  username: string;
  password: string;
  isVerified: boolean;
  role: string; // Add role field
}

// Create a schema corresponding to the document interface
const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, required: true, default: 'viewer' }, // Default role
});

// Create a model using the schema and interface
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
