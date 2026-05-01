import mongoose, { Schema, Model } from "mongoose";

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  model: string;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IConversationModel extends Model<IConversation> {}

const conversationSchema = new Schema<IConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Conversation",
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  model: {
    type: String,
    default: "gemini-2.0-flash",
    enum: ["gemini-2.0-flash", "gemini-1.5-pro"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps: true, versionKey: false});

conversationSchema.index({ userId: 1, lastMessageAt: -1 });

const Conversation = mongoose.model<IConversation, IConversationModel>(
  'Conversation',
  conversationSchema
);

export default Conversation;