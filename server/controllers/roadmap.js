import Roadmap from '../models/roadmap.js';
import { generatePrompt } from '../prompt/template.js';
import openai from '../utlis/openai.js';
import { focusOptions } from "../utlis/focusOptions.js";
import { buildFocusInstruction } from "../utlis/buildFocusInstruction.js";
import { advancedTheme, basicTheme } from '../utlis/sessiontheme.js';
import Personas from '../models/persona.js';

export const getRoadmaps = async (req, res) => {
  const { role, experience, selectedFocusAreas = [], resumeText = "", jdText = "", duration } = req.body;
  const selectedThemes = duration === 21 ? advancedTheme : basicTheme;

  const allPersonas = await Personas.find();
  const personaInstructions = allPersonas




  if (!role || !experience) {
    return res.status(400).json({ message: "Role and experience are required." });
  }

  const focusInstruction = buildFocusInstruction(selectedFocusAreas);

  try {
    const prompt = generatePrompt(role, experience, focusInstruction, resumeText, jdText, duration, selectedThemes, personaInstructions);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    
    const responseText = completion.choices[0].message.content.trim();
    
    // 🧹 Clean JSON inside ```json ... ``` wrapper
    const clean = responseText.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
    
    let json;
    try {
      json = JSON.parse(clean);
      console.log(json)
    } catch (e) {
      console.error("JSON parse error:", e);
      return res.status(500).json({ message: "AI returned invalid format. Please retry." });
    }
    
// If the parsed json itself is the roadmap array
const rawRoadmap = Array.isArray(json) ? json : json.roadmap;
console.log(rawRoadmap)

if (!Array.isArray(rawRoadmap)) {
  console.error("Expected roadmap to be an array but got:", rawRoadmap);
  return res.status(400).json({ message: "Invalid roadmap format from AI. Please check the AI response structure." });
}

const cleanedRoadmap = rawRoadmap.map(session => {
  const assigned = session.assignedPersona;

  return {
    ...session,
    assignedPersona: {
      persona_id: assigned?._id || null,
      persona_role: assigned?.persona_role || "",
      background: assigned?.background || "",
      persona_experience: assigned?.persona_experience || "",
    },
  };
});

console.log("Clean",cleanedRoadmap)

    const newRoadmap = new Roadmap({ role, experience,  roadmap: cleanedRoadmap, duration });
    await newRoadmap.save();

    res.json({ success: true, roadmap: json, prompt, personaInstructions });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFocusOptions = (req, res) => {
  res.status(200).json(focusOptions);
};


export const getRoadmapById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Roadmap ID is required." });
  }

  try {
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found." });
    }
    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching roadmap by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const sessionControl = async (req, res) => {
  try {
    const { roadmapId, sessionIndex } = req.params;
    const index = parseInt(sessionIndex, 10);

    if (isNaN(index)) {
      return res.status(400).json({ message: "Invalid session index" });
    }

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    if (!roadmap.roadmap[index]) {
      return res.status(404).json({ message: "Session not found at given index" });
    }

    roadmap.roadmap[index].isComplete = true;
    await roadmap.save();

    res.json({ success: true, updatedSession: roadmap.roadmap[index] });

  } catch (error) {
    console.error("Error marking session complete:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getallPersonas = async (req, res) => {
  try {
    const personas = await Personas.find();
    res.status(200).json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getPersonaById = async (req, res) => {
    try {
        const persona = await Personas.findById(req.params.id);
        if (!persona) return res.status(404).json({ message: "Persona not found" });
        res.status(200).json(persona);
    } catch (error) {
        console.error("Error fetching persona:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};