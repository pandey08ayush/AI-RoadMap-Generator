import React, { useState, useEffect, useRef } from 'react';
import '../Components/GuidedPop.css';
// import card_img from '../assets/interview-card.png';
// import { MdLock } from "react-icons/md";
// import { BsFillBellFill } from "react-icons/bs";
// import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
// import { FaUnlockKeyhole } from "react-icons/fa6";
// import aibtn from '../assets/aibtn.png';
import axios from 'axios';
// import { HiOutlineInformationCircle } from "react-icons/hi";
// import { RxCross2 } from "react-icons/rx";
import * as pdfjsLib from 'pdfjs-dist';
// import { BASE_URL } from '../utils/api';


// Set the workerSrc for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js`;

const GuidedRoadmapPopup = () => {
  const [userId, setUserId] = useState('');
  const [scheduleDate, setScheduleDate] = useState({ day: '', month: '', year: '' });
  const [scheduleTime, setScheduleTime] = useState({ hours: '', minutes: '', period: 'AM' });
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
//   const { user } = useAuth();
  const [jobRole, setJobRole] = useState('');
  const [intervention, setIntervention] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [roadmapLength, setRoadmapLength] = useState('');
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [jobDescriptionFileName, setJobDescriptionFileName] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [showJobRoleDropdown, setShowJobRoleDropdown] = useState(false);
  const [showInterventionDropdown, setShowInterventionDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showRoadmapLengthDropdown, setShowRoadmapLengthDropdown] = useState(false);
  const [showFocusAreaDropdown, setShowFocusAreaDropdown] = useState(false);
  const [isRoadmapGenerated, setIsRoadmapGenerated] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [roadmapCode, setRoadmapCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const jobRoleDropdownRef = useRef(null);
  const interventionDropdownRef = useRef(null);
  const experienceDropdownRef = useRef(null);
  const roadmapLengthDropdownRef = useRef(null);
  const focusAreaDropdownRef = useRef(null);
  const jobDescriptionFileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const [isToggled, setIsToggled] = useState(false);

  const jobRoles = ['UI UX Designer', 'Software Engineer', 'Data Analyst', 'Product Manager', 'Data Scientist', 'DevOps Engineer'];
  const interventions = ['Entry-Level (0 - 1 Yrs)', 'Entry-Level (1 - 2 Yrs)', 'Entry-Level (2 - 3 Yrs)', 'Mid-Level (3 - 5 Yrs)', 'Senior-Level (5+ Yrs)'];
  const experienceLevels = ['Entry-Level (0 - 1 Yrs)', 'Entry-Level (1 - 2 Yrs)', 'Entry-Level (2 - 3 Yrs)', 'Mid-Level (3 - 5 Yrs)', 'Senior-Level (5+ Yrs)'];
  const roadmapLengths = ['1 Month', '3 Months', '6 Months', '12 Months'];
  const focusAreas = [
    'Balanced (Default)',
    'Communication Clarity & Structure',
    'Verbal Delivery & Fluency',
    'Confidence & Professional Presence',
    'Active Listening & Interaction Quality',
    'Vocabulary & Language Precision',
    'Emotional Intelligence & Social Skills',
    'Technical Knowledge & Analytical Thinking (Role specific)',
    'Problem Solving & Critical Thinking'
  ];

  const validCode = 'PRESTIGEBBA001';

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobRoleDropdownRef.current && !jobRoleDropdownRef.current.contains(event.target)) {
        setShowJobRoleDropdown(false);
      }
      if (interventionDropdownRef.current && !interventionDropdownRef.current.contains(event.target)) {
        setShowInterventionDropdown(false);
      }
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target)) {
        setShowExperienceDropdown(false);
      }
      if (roadmapLengthDropdownRef.current && !roadmapLengthDropdownRef.current.contains(event.target)) {
        setShowRoadmapLengthDropdown(false);
      }
      if (focusAreaDropdownRef.current && !focusAreaDropdownRef.current.contains(event.target)) {
        setShowFocusAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

//   useEffect(() => {
//     if (user && user._id) {
//       setUserId(user._id);
//     }
//   }, [user]);

  useEffect(() => {
    if (showModal) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const period = now.getHours() >= 12 ? 'PM' : 'AM';
      setScheduleDate({ day, month, year });
      setScheduleTime({ hours: String(hours), minutes, period });
    }
  }, [showModal]);

  useEffect(() => {
    if (!isToggled && jobRole && intervention) {
      setActiveStep(3);
    } else if (isToggled && jobRole && experienceLevel && roadmapLength && selectedFocusAreas.length > 0) {
      setActiveStep(3);
    } else {
      setActiveStep(1);
    }
  }, [jobRole, intervention, isToggled, experienceLevel, roadmapLength, selectedFocusAreas]);

  useEffect(() => {
    setIsCodeValid(roadmapCode === validCode);
  }, [roadmapCode]);

  const handleSubmit = async () => {
    if (!scheduleDate.day || !scheduleDate.month || !scheduleDate.year || !scheduleTime.hours || !scheduleTime.minutes) {
      setMessage('Please fill all date and time fields');
      return;
    }
    const dateStr = `${scheduleDate.year}-${scheduleDate.month.padStart(2, '0')}-${scheduleDate.day.padStart(2, '0')} ${scheduleTime.hours.padStart(2, '0')}:${scheduleTime.minutes.padStart(2, '0')} ${scheduleTime.period}`;
    const scheduleDateTime = new Date(dateStr);
    if (isNaN(scheduleDateTime)) {
      setMessage('Invalid date or time format');
      return;
    }
    try {
            const response = await axios.post('http://localhost/vi/api/schedules', {
        userId,
        time: scheduleDateTime.toISOString()
      });
      setScheduleDate({ day: '', month: '', year: '' });
      setScheduleTime({ hours: '', minutes: '', period: 'AM' });
      setShowModal(false);
    } catch (error) {
      setMessage(`Error uploading schedule: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleNotifyClick = () => {
    setShowModal(true);
  };

  const handleJobRoleChange = (e) => {
    setJobRole(e.target.value);
    setShowJobRoleDropdown(true);
  };

  const handleJobRoleSelect = (role) => {
    setJobRole(role);
    setShowJobRoleDropdown(false);
  };

  const handleInterventionSelect = (int) => {
    setIntervention(int);
    setShowInterventionDropdown(false);
  };

  const handleExperienceSelect = (level) => {
    setExperienceLevel(level);
    setShowExperienceDropdown(false);
  };

  const handleRoadmapLengthSelect = (length) => {
    setRoadmapLength(length);
    setShowRoadmapLengthDropdown(false);
  };

  const handleFocusAreaSelect = (area) => {
    if (!selectedFocusAreas.includes(area)) {
      setSelectedFocusAreas([...selectedFocusAreas, area]);
    } else {
      setSelectedFocusAreas(selectedFocusAreas.filter((selected) => selected !== area));
    }
    setFocusAreaInput("");
  };

  const handleRemoveFocusArea = (areaToRemove) => {
    setSelectedFocusAreas(selectedFocusAreas.filter((area) => area !== areaToRemove));
  };

  const handleGenerateRoadmap = () => {
    if ((!isToggled && jobRole && intervention) || (isToggled && jobRole && experienceLevel && roadmapLength && selectedFocusAreas.length > 0)) {
      // Instead of setting isRoadmapGenerated to true, close the popup
      setShowModal(false); // This assumes the popup is controlled internally; adjust if managed by parent
    }
  };

  const handleRoadmapCodeChange = (e) => {
    setRoadmapCode(e.target.value.trim());
  };

  const handleUnlockRoadmap = () => {
    if (isCodeValid) {
      setShowModal(false); // Close popup on valid code unlock
      setRoadmapCode('');
    }
  };

  const handleJobDescriptionInput = (e) => {
    const text = e.currentTarget.textContent;
    setJobDescription(text);
  };

  const handleResumeInput = (e) => {
    const text = e.currentTarget.textContent;
    setResume(text);
  };

  const handleJobDescriptionSave = () => {
    console.log('Job Description saved:', jobDescription);
  };

  const handleResumeSave = () => {
    console.log('Resume saved:', resume);
  };

  const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n';
      }
      return text.replace(/[\u200E\u200F\u202A-\u202E]/g, ''); // Remove RTL/LTR marks
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return 'Error: Unable to extract text from PDF.';
    }
  };

  const handleJobDescriptionFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setJobDescriptionFileName(file.name);
      if (file.type === 'application/pdf') {
        const text = await extractPdfText(file);
        setJobDescription(text);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
          setJobDescription(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleResumeFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFileName(file.name);
      if (file.type === 'application/pdf') {
        const text = await extractPdfText(file);
        setResume(text);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
          setResume(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleRemoveJobDescriptionFile = () => {
    setJobDescriptionFileName('');
    setJobDescription('');
    if (jobDescriptionFileInputRef.current) {
      jobDescriptionFileInputRef.current.value = '';
    }
  };

  const handleRemoveResumeFile = () => {
    setResumeFileName('');
    setResume('');
    if (resumeFileInputRef.current) {
      resumeFileInputRef.current.value = '';
    }
  };

  return (
    <div className='main-roadmap-popup'>
      <div className="roadmap-header">
        <div className="roadmap-content">
          <h1>Add New Roadmap</h1>
          {/* <p>A personalized skill journey based on your role and growth areas</p> */}
        </div>
        <div className='right-roadmap-content'>
          {!isRoadmapGenerated && (
            <div className="advance-customization">
              <span>
                <p> Advance Customization</p>
              </span>
              <div
                className={`switch-customization ${isToggled ? 'on' : 'off'}`}
                onClick={handleToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
              />
            </div>
          )}
          {isRoadmapGenerated && (
            <>
              <span className='dys-btn'>30 days streak</span>
              <span className='view-all-btn'>View all</span>
            </>
          )}
        </div>
      </div>

      {!isRoadmapGenerated && (
        <div className='initial-roadmap'>
          {!isToggled ? (
            <>
              <div className="roadmap-selection">
                <div className='roadmap-selection-role' ref={jobRoleDropdownRef}>
                  <div className="input-container">
                    <input
                      type="text"
                      value={jobRole}
                      onChange={handleJobRoleChange}
                      placeholder="Select Job Role"
                      className={`selection-input ${jobRole ? 'selection-input-filled' : ''}`}
                      aria-label="Select job role"
                    />
                    <span
                      className="dropdown-toggle-icon fixed-icon"
                      onClick={() => setShowJobRoleDropdown(!showJobRoleDropdown)}
                    >
                      {/* {showJobRoleDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                    </span>
                  </div>
                  {showJobRoleDropdown && (
                    <div className="dropdown-select">
                      {jobRoles
                        .filter((role) => role.toLowerCase().includes(jobRole.toLowerCase()))
                        .map((role, index) => (
                          <div
                            key={index}
                            className="dropdown-select-item"
                            onClick={() => handleJobRoleSelect(role)}
                          >
                            {role}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className='roadmap-selection-intervention' ref={interventionDropdownRef}>
                  <div className="input-container">
                    <input
                      type="text"
                      value={intervention}
                      readOnly
                      onClick={() => setShowInterventionDropdown(!showInterventionDropdown)}
                      placeholder="Select Level"
                      className={`selection-input ${intervention ? 'selection-input-filled' : ''}`}
                      aria-readonly="true"
                      aria-label="Select intervention level"
                    />
                    <span
                      className="dropdown-toggle-icon fixed-icon"
                      onClick={() => setShowInterventionDropdown(!showInterventionDropdown)}
                    >
                      {/* {showInterventionDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                    </span>
                  </div>
                  {showInterventionDropdown && (
                    <div className="dropdown-select">
                      {interventions.map((int, index) => (
                        <div
                          key={index}
                          className="dropdown-select-item"
                          onClick={() => handleInterventionSelect(int)}
                        >
                          {int}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='roadmap-selection-intervention'>
                  <button
                    onClick={handleGenerateRoadmap}
                    className='roadmap-selection-intervention'
                    disabled={!jobRole || !intervention}
                  >
                    <span>Generate With AI</span> 
                  </button>
                </div>
              </div>
              <div className="roadmap-code">
                <p className="or-line">OR</p>
                <h4>Have a roadmap code?</h4>
                <p>Use the code shared by your college, company, or mentor to unlock your custom skill plan.</p>
                <div className="roadmap-code-input">
                  <input
                    type="text"
                    value={roadmapCode}
                    onChange={handleRoadmapCodeChange}
                    placeholder="Enter Code here"
                    className={`code-btn ${!isCodeValid && roadmapCode ? 'selection-input-error' : ''}`}
                  />
                  <button
                    onClick={handleUnlockRoadmap}
                    disabled={!isCodeValid}
                    className="unlock-roadmap-btn"
                  >
                    Unlock Roadmap 
                  </button>
                </div>
                {!isCodeValid && roadmapCode && (
                  <p className="text-red-500">Invalid roadmap code</p>
                )}
              </div>
            </>
          ) : (
            <div className="advanced-form">
              <div className="roadmap-selection">
                <div className='roadmap-section-wrapper roadmap-selection-role' ref={jobRoleDropdownRef}>
                  <label>Job Role</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={jobRole}
                      onChange={handleJobRoleChange}
                      placeholder="Job Role"
                      className={`selection-input ${jobRole ? 'selection-input-filled' : ''}`}
                      aria-label="Select job role"
                    />
                    <span
                      className="dropdown-toggle-icon fixed-icon"
                      onClick={() => setShowJobRoleDropdown(!showJobRoleDropdown)}
                    >
                      {/* {showJobRoleDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                    </span>
                  </div>
                  {showJobRoleDropdown && (
                    <div className="dropdown-select">
                      {jobRoles
                        .filter((role) => role.toLowerCase().includes(jobRole.toLowerCase()))
                        .map((role, index) => (
                          <div
                            key={index}
                            className="dropdown-select-item"
                            onClick={() => handleJobRoleSelect(role)}
                          >
                            {role}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className='roadmap-section-wrapper roadmap-selection-intervention intervention-radius' ref={experienceDropdownRef}>
                  <label>Experience Level</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={experienceLevel}
                      readOnly
                      onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
                      placeholder="Select Level"
                      className={`selection-input ${experienceLevel ? 'selection-input-filled' : ''}`}
                      aria-readonly="true"
                      aria-label="Select experience level"
                    />
                    <span
                      className="dropdown-toggle-icon fixed-icon"
                      onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
                    >
                      {/* {showExperienceDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                    </span>
                  </div>
                  {showExperienceDropdown && (
                    <div className="dropdown-select">
                      {experienceLevels.map((level, index) => (
                        <div
                          key={index}
                          className="dropdown-select-item"
                          onClick={() => handleExperienceSelect(level)}
                        >
                          {level}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='roadmap-section-wrapper roadmap-selection-intervention length-preference-radius' ref={roadmapLengthDropdownRef}>
                  <label>Roadmap Length Preference</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={roadmapLength}
                      readOnly
                      onClick={() => setShowRoadmapLengthDropdown(!showRoadmapLengthDropdown)}
                      placeholder="Select Length"
                      className={`selection-input ${roadmapLength ? 'selection-input-filled' : ''}`}
                      aria-readonly="true"
                      aria-label="Select roadmap length"
                    />
                    <span
                      className="dropdown-toggle-icon fixed-icon"
                      onClick={() => setShowRoadmapLengthDropdown(!showRoadmapLengthDropdown)}
                    >
                      {/* {showRoadmapLengthDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                    </span>
                  </div>
                  {showRoadmapLengthDropdown && (
                    <div className="dropdown-select">
                      {roadmapLengths.map((length, index) => (
                        <div
                          key={index}
                          className="dropdown-select-item"
                          onClick={() => handleRoadmapLengthSelect(length)}
                        >
                          {length}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className='roadmap-focus roadmap-section-wrapper'>
                <div className='roadmap-selection-intervention-advanced' ref={focusAreaDropdownRef}>
                  <label>Focus Area(s)</label>
                  <div className="input-container-advanced">
                    <div className="expandable-input">
                      <div className="selected-values">
                        <div className="input-wrapper">
                          <input
                            type="text"
                            value={focusAreaInput}
                            readOnly
                            onClick={() => setShowFocusAreaDropdown(!showFocusAreaDropdown)}
                            placeholder={selectedFocusAreas.length === 0 ? "Focus Area(s)" : ""}
                            className={`focus-area-input ${focusAreaInput || showFocusAreaDropdown || selectedFocusAreas.length > 0
                              ? 'active-border'
                              : ''
                              }`}
                            aria-readonly="true"
                            aria-label="Select focus areas"
                          />
                          <span
                            className="dropdown-toggle-icon fixed-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFocusAreaDropdown(!showFocusAreaDropdown);
                            }}
                          >
                            {/* {showFocusAreaDropdown ? <FaAngleUp /> : <FaAngleDown />} */}
                          </span>
                        </div>
                        {selectedFocusAreas.map((area, index) => (
                          <div key={index} className="selected-value">
                            {area}
                            <span
                              className="remove-value"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFocusArea(area);
                              }}
                            >
                              {/* <RxCross2 /> */}
                            </span>
                          </div>
                        ))}
                      </div>
                      {showFocusAreaDropdown && (
                        <div className="dropdown-options">
                          {focusAreas
                            .filter((area) => !selectedFocusAreas.includes(area) || selectedFocusAreas.includes(area))
                            .map((area, index) => (
                              <div
                                key={index}
                                className="dropdown-option-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFocusAreaSelect(area);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFocusAreas.includes(area)}
                                  onChange={() => handleFocusAreaSelect(area)}
                                  className="focus-area-checkbox"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span>{area}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='roadmap-section-wrapper advanced-textarea-description'>
                <div className='text-box-container'>
                  <label>Paste or Upload Job Description</label>
                  <div
                    contentEditable="true"
                    onInput={handleJobDescriptionInput}
                    className="editable-box ltr-input"
                    data-placeholder="Paste or type job description here"
                    dir="ltr"
                    suppressContentEditableWarning={true}
                    role="textbox"
                    aria-multiline="true"
                    aria-label="Job description input"
                  />

                  <button onClick={handleJobDescriptionSave} className="save-button-advanced">Save</button>
                </div>
                <div className="upload-option">
                  <p className="or-line">Or</p>
                  <div className='upload-btn-description'>
                    {jobDescriptionFileName ? (
                      <div className="file-name-container">
                        <span
                          className={jobDescriptionFileName ? "file-name active" : "file-name"}
                        >
                          {jobDescriptionFileName}
                        </span>
                        <span
                          className="remove-file"
                          onClick={handleRemoveJobDescriptionFile}
                        >
                          {/* <RxCross2 color='#006894' size={16} /> */}
                        </span>
                      </div>
                    ) : (
                      <span>Choose a file to upload here</span>
                    )}
                    <label className="upload-button-advanced">
                      Browse File
                      <input
                        type="file"
                        ref={jobDescriptionFileInputRef}
                        onChange={handleJobDescriptionFileUpload}
                        style={{ display: 'none' }}
                        accept=".pdf,.txt"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className='roadmap-section-wrapper advanced-textarea-resume'>
                <div className='text-box-container'>
                  <label>Paste or Upload Resume (Optional)</label>
                  <div
                    contentEditable="true"
                    onInput={handleResumeInput}
                    className="editable-box ltr-input"
                    data-placeholder="Paste or type resume here (optional)"
                    dir="ltr"
                    suppressContentEditableWarning={true}
                    role="textbox"
                    aria-multiline="true"
                    aria-label="Resume input"
                  />

                  <button onClick={handleResumeSave} className="save-button-advanced">Save</button>
                </div>
                <div className="upload-option">
                  <p className="or-line">Or</p>
                  <div className='upload-btn-description'>
                    {resumeFileName ? (
                      <div className="file-name-container">
                        <span
                          className={resumeFileName ? "file-name active" : "file-name"}
                        >
                          {resumeFileName}
                        </span>
                        <span
                          className="remove-file"
                          onClick={handleRemoveResumeFile}
                        >
                          {/* <RxCross2 color='#006894' size={16} /> */}
                        </span>
                      </div>
                    ) : (
                      <span>Choose a file to upload here</span>
                    )}
                    <label className="upload-button-advanced">
                      Browse File
                      <input
                        type="file"
                        ref={resumeFileInputRef}
                        onChange={handleResumeFileUpload}
                        style={{ display: 'none' }}
                        accept=".pdf,.txt"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className='advancedai-button-container'>
                <div className='roadmap-selection-intervention'>
                  <button
                    onClick={handleGenerateRoadmap}
                    className='advancedai-btn'
                    disabled={!jobRole || !experienceLevel || !roadmapLength || selectedFocusAreas.length === 0}
                  >
                    <span>Generate With AI</span> 
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isRoadmapGenerated && (
        <div className='learning-roadmap-card'>
          <div className='locked-right'>
            <div className='report-card'>
              <div className='report-card-header'>
                <div className='card-title'>
                  <span>Dialogue</span>
                  <h2>Interview Skill</h2>
                  <p>Technical</p>
                </div>
              </div>
              <div className='progress-circles-roadmap'>
                <div className='progress-circle'>
                  <div className='circle technical'>
                    <span>83%</span>
                  </div>
                </div>
              </div>
              <div className='report-card-btn'>
                <button>View Report</button>
              </div>
            </div>
            <div className='fst-card'>
              <div className='card-title'>
                <span>Dialogue</span>
                <h2>Interview Skill</h2>
                <p>Technical</p>
              </div>
              <div className='card-img'>
                <img src={card_img} alt="Interview Card" />
              </div>
              <div className='card-btn'>
                <button>Begin Now</button>
              </div>
            </div>
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className='locked-card'>
                <div className='card-title'>
                  <span>Dialogue</span>
                  <h2>Interview Skill</h2>
                  <p>Technical</p>
                </div>
                <div className='card-img'>
                  {/* <MdLock /> */}
                </div>
                <div className='locked-btn'>
                  <button onClick={handleNotifyClick} className='cursor-pointer'>
                    Notify Me <BsFillBellFill />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowModal(false)}
              className="modal-close-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="modal-title">Set Notification Time</h2>
            <div className="date-time-picker">
              <div className="section-title">Select Date</div>
              <div className="date-grid">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={scheduleDate.day}
                  onChange={(e) => setScheduleDate({ ...scheduleDate, day: e.target.value })}
                  className="date-input"
                  placeholder="DD"
                />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={scheduleDate.month}
                  onChange={(e) => setScheduleDate({ ...scheduleDate, month: e.target.value })}
                  className="date-input"
                  placeholder="MM"
                />
                <input
                  type="number"
                  min="2025"
                  value={scheduleDate.year}
                  onChange={(e) => setScheduleDate({ ...scheduleDate, year: e.target.value })}
                  className="date-input"
                  placeholder="YYYY"
                />
              </div>
              <div className="section-title">Choose time</div>
              <div className="time-grid">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={scheduleTime.hours}
                  onChange={(e) => setScheduleTime({ ...scheduleTime, hours: e.target.value })}
                  className="time-input"
                  placeholder="HH"
                />
                <span className="time-separator">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={scheduleTime.minutes}
                  onChange={(e) => setScheduleTime({ ...scheduleTime, minutes: e.target.value })}
                  className="time-input"
                  placeholder="MM"
                />
                <button
                  className={`period-button ${scheduleTime.period === 'AM' ? 'active' : ''}`}
                  onClick={() => setScheduleTime({ ...scheduleTime, period: 'AM' })}
                >
                  AM
                </button>
                <button
                  className={`period-button ${scheduleTime.period === 'PM' ? 'active' : ''}`}
                  onClick={() => setScheduleTime({ ...scheduleTime, period: 'PM' })}
                >
                  PM
                </button>
              </div>
            </div>
            {message && <p className="text-red-500">{message}</p>}
            <div className="modal-buttons">
              <button
                onClick={handleSubmit}
                className="schedule-button"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedRoadmapPopup;