import mongoose, { Document, Schema, Model } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  tokens?: number; // Track token usage for billing later
  isError: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessageModel extends Model<IMessage> {}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [32000, "Message too long"],
    },
    tokens: {
      type: Number,
      default: 0,
    },
    isError: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model<IMessage, IMessageModel>(
  "Message",
  messageSchema,
);
export default Message;
