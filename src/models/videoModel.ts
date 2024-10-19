import mongoose, { Document, Schema, Model } from 'mongoose';

interface IVideo extends Document {
  filename: string;
  path: string;
  user: string;
  status: string;
}

const videoSchema: Schema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['processing', 'ready'], default: 'processing' }
});

const Video: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);

export default Video;
