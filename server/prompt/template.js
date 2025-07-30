import { focusOptions } from '../utlis/focusOptions.js' // ✅ this fixes your error

export const generatePrompt = (
  role,
  experience,
  focusInstruction = "",
  resumeText = "",
  jdText = "",
  personaInstructions = [],
  duration = 7, // Default to 7 sessions if not provided,
  selectedThemes = []
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

   const formattedPersonas = JSON.stringify(
    (Array.isArray(personaInstructions) ? personaInstructions : []).map(p => ({
      _id: p._id,
      name: p.name
    })),
    null,
    2
  );

   const sessionThemeText = Array.isArray(selectedThemes)
    ? selectedThemes.map((theme, index) => `\n${index + 1}. ${theme}`).join("")
    : "";


  return `
You are an expert mock interview system. Based on the following inputs:


Generate a detailed ${duration} Intervention mock interview training plan for a candidate with:
Each session must be unique and aligned with the candidate profile.
You MUST generate ${duration} sessions, even if fewer themes or personas are provide

- Job Role: ${role}
- Years of Experience: ${experience}
${resumeText ? `- Resume Summary: ${resumeText}` : ""}
${jdText ? `- Job Description Summary: ${jdText}` : ""}
Focus Areas: ${focusString} ${!focusInstruction ? "(default focus areas used)" : ""}

Personas List:
${formattedPersonas}

Each persona object contains only "_id" and "name". 
Assign personas to sessions in order. 
If there are fewer personas than sessions, cycle through them.
Do NOT skip any session due to fewer personas.

Session Themes (use these in order, and repeat or invent realistic ones if fewer than ${duration}):
${sessionThemeText}

For each session:
- Align the interviewInstruction and purpose with the session theme.
- Generate 3-5 unique interview questions per session, varying each time.
-If focus areas are selected, prioritize them alongside the session theme, role, and experience; otherwise, default to evaluating core areas such as Communication, Verbal Fluency, Confidence, Listening, Language Precision, Emotional Intelligence, Technical Knowledge, and Problem Solving with session theme, role, and experience;
For each day/session, return a JSON object with:
- sessionTitle
- purpose
- interviewInstruction : Detailed guidance to the interviewer about how to conduct this session. This must:
  - Be based on the job role and experience of user Job Role: ${role}.
  - Be tailored to the specific day's theme
  - Describe how to evaluate the candidate
  - Mention what specific skills or behavior to look for
  ${focusEvaluatorHint}${resumeJdHint}

- questions: 3-5 sample questions. These questions must be varied and dynamic, even if the job role and experience is same. If two different users provide same job role and experience, questions must still be different.

- "assignedPersona": An object with:
  - "_id": from the Personas List
  - "name": from the Personas List
  - "persona_role": A realistic job title that genreated from  the session’s theme and  Job Role: ${role}:
  - "background": A 2-3 line summary making the persona a natural evaluator for this session’s theme and Job Role: ${role} and dont take persona background.
    Mention relevant experience, expertise, and domain.
  - "persona_experience": Generated according to persona_role in number.

Strict rules:
- The persona_"role" and "background" must change per session theme .
- They must align with the session theme, Job Role, and experience.
- Do **not reuse** role/background between sessions.
- Do **not derive role/experience from the persona — only use "_id" and "name".

-Use the persona's tone and expertise to reflect in the **interviewInstruction**.

 
Return the output strictly in JSON array format without markdown or extra text, like:
[
  {
    "sessionTitle": "...",
    "purpose": "...",
    "interviewInstruction": "...",
    "questions": ["...", "...", "..."],
     "assignedPersona": {
      "_id": "<from formattedPersonas>",
      "name": "<from formattedPersonas>",
      "persona_role": "<generated>",
      "background": "<generated>",
      "persona_experience" : "<generated>"
    }
  },
  ...
]
`;
};