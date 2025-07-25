import React, { useEffect, useState } from "react";
import axios from "axios";
import { extractTextFromPDF, extractTextFromDocx } from "./Extractor"; // Import the extractor functions

function App() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);
  const [focusOptions, setFocusOptions] = useState([]);
  const [roadmapLength, setRoadmapLength] = useState(7); // Default to 7 days
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch focus areas from backend
  useEffect(() => {
  const fetchFocusOptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/focus");

      // ✅ Check if it's an object
      if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
        setFocusOptions(response.data);
      } else {
        console.error("Expected an object from /focus, got:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch focus options:", error);
    }
  };

  fetchFocusOptions();
}, []);


  // Handle file upload and extract text
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    let text = "";
    if (file.type === "application/pdf") {
      text = await extractTextFromPDF(file);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDocx(file);
    } else {
      alert("Only PDF or DOCX files are supported.");
      return;
    }

    if (type === "resume") setResumeText(text);
    else if (type === "jd") setJdText(text);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!role || !experience) {
      alert("Please provide job role and experience.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/roadmaps", {
        role,
        experience,
        selectedFocusAreas,
        resumeText,
        jdText,
        duration: roadmapLength,
      });

      setResult(res.data.roadmap || []);
      console.log("Response from backend:", res.data);
    } catch (err) {
      console.error("Error generating roadmap:", err);
      alert("Failed to generate roadmap. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Interview Roadmap Generator</h1>

      {/* Role & Experience */}
      <div className="form space-y-4">
        <input
          type="text"
          placeholder="Enter Job Role"
          value={role}
          className="w-full p-2 border rounded"
          onChange={(e) => setRole(e.target.value)}
        />

        <select
          value={experience}
          className="w-full p-2 border rounded"
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">Select Experience Level</option>
          <option value="Fresher">Fresher</option>
          <option value="0-2 years">0-2 years</option>
          <option value="2-4 years">2-4 years</option>
          <option value="4-6 years">4-6 years</option>
          <option value="6+ years">6+ years</option>
          <option value="10+ years">10+ years</option>
        </select>
      </div>

      {/* Resume Upload or Paste */}
      <div className="space-y-2">
        <label className="font-semibold">Upload Resume (PDF/DOCX):</label>
        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, "resume")} />
        <textarea
          className="w-full h-32 p-2 border rounded"
          placeholder="Or paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>

      {/* JD Upload or Paste */}
      <div className="space-y-2">
        <label className="font-semibold">Upload Job Description (PDF/DOCX):</label>
        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, "jd")} />
        <textarea
          className="w-full h-32 p-2 border rounded"
          placeholder="Or paste the job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
      </div>

      {/* Focus Area Selection */}
      <div>
        <label className="font-semibold">Select Focus Areas (optional):</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
  {Object.keys(focusOptions).map((title) => (
    <label key={title} className="flex items-center space-x-2">
      <input
        type="checkbox"
        value={title}
        checked={selectedFocusAreas.includes(title)}
        onChange={(e) => {
          const value = e.target.value;
          if (e.target.checked) {
            setSelectedFocusAreas([...selectedFocusAreas, value]);
          } else {
            setSelectedFocusAreas(selectedFocusAreas.filter((area) => area !== value));
          }
        }}
      />
      <span>{title}</span>
    </label>
  ))}
</div>

      </div>

      {/* Roadmap Length */}
      <div>
        <label className="font-semibold">Select Session Length:</label>
        <select
          className="w-full p-2 border rounded"
          value={roadmapLength}
          onChange={(e) => setRoadmapLength(Number(e.target.value))}
        >
          <option value={7}>7 Session</option>
          <option value={21}>21 Session</option>
        </select>
      </div>

      {/* Submit */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generated Roadmap"}
      </button>

      {/* Output */}
      <div className="output space-y-4 mt-6">
        {result.map((session, i) => (
          <div key={i} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">
              Day {i + 1}: {session.sessionTitle}
            </h3>
            <p><strong>Purpose:</strong> {session.purpose}</p>
            <p><strong>Instruction:</strong> {session.interviewInstruction}</p>
            <p><strong>Sample Questions:</strong></p>
            <ul className="list-disc pl-5">
              {session.questions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
