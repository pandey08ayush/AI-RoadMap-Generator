import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  duration: { type: Number, default: 7 }, 
  roadmap: {
    type: [
      {
        sessionTitle: String,
        purpose: String,
        interviewInstruction: String,
        questions: [String],
        isComplete: {
          type: Boolean,
          default: false, // All sessions start as incomplete
        },
      }
    ],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Roadmap", roadmapSchema);
