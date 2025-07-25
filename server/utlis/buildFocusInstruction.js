// utils/buildFocusInstruction.js
import { focusOptions } from "./focusOptions.js";

export const buildFocusInstruction = (selectedFocusAreas = []) => {
  if (!selectedFocusAreas.length) {
    return "Balance the roadmap across communication, technical, behavioral, and domain knowledge.";
  }
  

  let instruction = "Focus Areas for improvement:\n";

  selectedFocusAreas.forEach(area => {
    const subs = focusOptions[area] || [];
    instruction += `- ${area}${subs.length ? `:\n  - ${subs.join("\n  - ")}` : ""}\n`;
  });

  return instruction;
};
