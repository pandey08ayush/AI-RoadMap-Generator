// utils/buildFocusInstruction.js
import { focusOptions } from "./focusOptions.js";

export const buildFocusInstruction = (selectedFocusAreas = []) => {
  if (!selectedFocusAreas.length) {
    return "Balance the roadmap across `Personal Introduction & Career Fit, Problem-Solving & Role Understanding ,Behavioral Skills: STAR Approach,Handling Stress & Uncertainty,Aligning with Company Culture,Real-World Scenario Simulation,Final Round: Mixed Questions Practice and domain knowledge.";
  }
  

  let instruction = "Focus Areas for improvement:\n";

  selectedFocusAreas.forEach(area => {
    const subs = focusOptions[area] || [];
    instruction += `- ${area}${subs.length ? `:\n  - ${subs.join("\n  - ")}` : ""}\n`;
  });

  return instruction;
};
