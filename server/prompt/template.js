import { focusOptions } from '../utlis/focusOptions.js' // ✅ this fixes your error

export const generatePrompt = (
  role,
  experience,
  focusInstruction = "",
  resumeText = "",
  jdText = "",
  duration = 7, // Default to 7 sessions if not provided,
  selectedThemes
) => {
   const defaultFocusList = [
    "Communication",
    "Verbal Delivery & Fluency",
    "Confidence & Professional Presence",
    "Active Listening and Interaction Quality",
    "Vocabulary & Language Precision",
    "Emotional Intelligence & Social Skills",
    "Technical Knowledge & Analytical Thinking",
    "Problem Solving & Critical Thinking"
  ];

  const focusAreas = focusInstruction
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f && focusOptions[f]);

  const focusEvaluatorHint = focusAreas.length
    ? `\n\nIn interviewerInstruction, also incorporate the following focus areas and sub-skills into the evaluation criteria:\n` +
      focusAreas
        .map((area) => {
          const subs = focusOptions[area] || [];
          return `- ${area}${subs.length ? `:\n  - ${subs.join("\n  - ")}` : ""}`;
        })
        .join("\n")
    : "";

  const resumeJdHint =
    resumeText.trim() && jdText.trim()
      ? `\n\nCandidate Resume:\n${resumeText}\n\nJob Description:\n${jdText}`
      : "";

  const focusString = focusInstruction
    ? focusInstruction
    : defaultFocusList.join(", ");


  return `
You are an expert mock interview system. Based on the following inputs:

Generate a detailed ${duration} Intervention mock interview training plan for a candidate with:
- Job Role: ${role}
- Years of Experience: ${experience}
${resumeText ? `- Resume Summary: ${resumeText}` : ""}
${jdText ? `- Job Description Summary: ${jdText}` : ""}
Focus Areas: ${focusString} ${!focusInstruction ? "(default focus areas used)" : ""}

The structure must follow these session themes:
Session themes:${selectedThemes.map((theme, index) => `\n${index + 1}. ${theme}`).join("")}

For each session:
- Align the interviewInstruction and purpose with the session theme.
- Generate 3-5 unique interview questions per session, varying each time.
-If focus areas are selected, prioritize them alongside the session theme, role, and experience; otherwise, default to evaluating core areas such as Communication, Verbal Fluency, Confidence, Listening, Language Precision, Emotional Intelligence, Technical Knowledge, and Problem Solving with session theme, role, and experience;
For each day/session, return a JSON object with:
- sessionTitle
- purpose
- interviewInstruction : Detailed guidance to the interviewer about how to conduct this session. This must:
  - Be based on the job role and experience
  - Be tailored to the specific day's theme
  - Describe how to evaluate the candidate
  - Mention what specific skills or behavior to look for
  ${focusEvaluatorHint}${resumeJdHint}

- questions: 3-5 sample questions. These questions must be varied and dynamic, even if the job role and experience is same. If two different users provide same job role and experience, questions must still be different.

Return the output strictly in JSON array format without markdown or extra text, like:
[
  {
    "sessionTitle": "...",
    "purpose": "...",
    "interviewInstruction": "...",
    "questions": ["...", "...", "..."]
  },
  ...
]
`;
};
