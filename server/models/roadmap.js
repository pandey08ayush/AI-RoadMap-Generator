import mongoose from "mongoose";
import Personas from './persona.js';

const roadmapSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 7
  },
  roadmap: {
    type: [
      {
        sessionTitle: String,
        purpose: String,
        interviewInstruction: String,
        questions: [String],
        assignedPersona: {
       
            persona_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Personas',
              required: false,
            },
            persona_role: {
              type: String,
              required: false,
            },
            background: {
              type: String,
              required: false,
            },
            persona_experience: {
              type: String,
              required: false,
            }
          },
        
        isComplete: {
          type: Boolean,
          default: false,
        }
      }
    ],
    required: true
  }
});

export default mongoose.model("Roadmap", roadmapSchema);
