import Roadmap from '../models/roadmap.js';
import { generatePrompt } from '../prompt/template.js';
import openai from '../utlis/openai.js';
import { focusOptions } from "../utlis/focusOptions.js";
import { buildFocusInstruction } from "../utlis/buildFocusInstruction.js";
import { advancedTheme, basicTheme } from '../utlis/sessiontheme.js';

export const getRoadmaps = async (req, res) => {
  const { role, experience, selectedFocusAreas = [], resumeText = "", jdText = "", duration} = req.body;
  const selectedThemes = duration === 21 ? advancedTheme : basicTheme;

  if (!role || !experience) {
    return res.status(400).json({ message: "Role and experience are required." });
  }

  const focusInstruction = buildFocusInstruction(selectedFocusAreas);

  try {
    const prompt = generatePrompt(role, experience, focusInstruction, resumeText, jdText,duration,selectedThemes);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const responseText = completion.choices[0].message.content.trim();

    // 🧹 Clean JSON inside ```json ... ``` wrapper
    const clean = responseText.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();

    let json;
    try {
      json = JSON.parse(clean);
    } catch (e) {
      console.error("JSON parse error:", e);
      return res.status(500).json({ message: "AI returned invalid format. Please retry." });
    }

    const newRoadmap = new Roadmap({ role, experience, roadmap: json ,duration });
    await newRoadmap.save();

    res.json({ success: true, roadmap: json, prompt });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFocusOptions = (req, res) => {
  res.status(200).json(focusOptions);
};
