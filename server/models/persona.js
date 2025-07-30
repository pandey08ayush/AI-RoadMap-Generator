// models/Persona.js
import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  accent: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  voiceId: {
    type: String,
    required: true,
  },
  demeanor: {
    type: String,
    required: true,
  },
  background: {
    type: String,
    required: true,
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
});

const Personas = mongoose.model('Personas', personaSchema);

export default Personas;
