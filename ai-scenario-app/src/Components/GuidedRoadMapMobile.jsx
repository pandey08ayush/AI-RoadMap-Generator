
import React, { useState, useEffect, useRef } from 'react';
import '../Components/Guided.css';
// import card_img from '../assets/interview-card.png';
import { MdLock } from "react-icons/md";
import { BsFillBellFill } from "react-icons/bs";
import axios from 'axios';
// import { useAuth } from '../store/auth';
import { FaAngleDown, FaCheck, FaPlus } from "react-icons/fa6";
// import { BASE_URL } from '../utils/api';
import GuidedRoadmapPopup from './GuidedRodmapPopup'; // Adjust the import path as needed
import { RxCross1 } from "react-icons/rx";
import { MdDeleteOutline } from "react-icons/md";

const GuidedRoadmapViewAllSingle = () => {
    const [userId, setUserId] = useState('');
    const [scheduleDate, setScheduleDate] = useState({ day: '', month: '', year: '' });
    const [scheduleTime, setScheduleTime] = useState({ hours: '', minutes: '', period: 'AM' });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDays, setSelectedDays] = useState(7);
    const [roadmapData, setRoadmapData] = useState([]);
    const [totalSessions, setTotalSessions] = useState(0);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPersonaPopup, setShowPersonaPopup] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState([
        { value: 7, type: 'roadmap', number: 7, text: 'Software Developer' },
        { value: 21, type: 'roadmap', number: 21, text: 'Software Developer' },
        { value: 'add-new', type: 'add-new', label: 'Add another Roadmap' },
    ]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteOptionValue, setDeleteOptionValue] = useState(null);
    const dropdownRef = useRef(null);
    // const { user } = useAuth();

    const roadmapId = "6889d072c934b8ad40546a4a"


    const setInitialDateTime = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours() % 12 || 12;
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const period = now.getHours() >= 12 ? 'PM' : 'AM';

        setScheduleDate({ day, month, year });
        setScheduleTime({ hours: String(hours), minutes, period });
    };

    const fetchRoadmap = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/roadmaps/${roadmapId}`);
                // console.log(res.data.roadmap[0]._id)
                setRoadmapData(res.data.roadmap);
                setTotalSessions(res.data.roadmap.length);
                // console.log("Fetched roadmap data:", res.data.roadmap);
            } catch (err) {
                console.error("Error fetching roadmap:", err);
            }
        };
        fetchRoadmap()

       const markSessionComplete = async (index) => {
        try {
            const res = await axios.patch(
                `http://localhost:5000/api/roadmaps/${roadmapId}/sessions/${index}`
            );
            // console.log('Marked as complete:', res.data);
            await fetchRoadmap(); // Refresh the roadmap with updated status
        } catch (error) {
            console.error('Error marking session complete:', error);
        }
    };


    useEffect(() => {
        if (showModal) {
            setInitialDateTime();
        }
    }, [showModal]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleDaysChange = (value) => {
        if (value === 'add-new') {
            setShowPopup(true);
            setSelectedDays(7);
        } else {
            setSelectedDays(parseInt(value));
        }
        setIsDropdownOpen(false);
    };

    const handleDeleteOption = (value) => {
        setDeleteOptionValue(value);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setDropdownOptions(dropdownOptions.filter((option) => option.value !== deleteOptionValue));
        if (selectedDays === deleteOptionValue) {
            setSelectedDays(7);
        }
        setShowDeleteConfirm(false);
        setDeleteOptionValue(null);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteOptionValue(null);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const renderCards = () => {
        const totalCards = selectedDays;

        const attemptIndex = roadmapData.findIndex(
            (session) => !session.isLocked && !session.isComplete
        );

        const allCards = roadmapData.map((session, index) => {
            // console.log("Session data",session.assignedPersona.persona_id)
            // LOCK all cards that come after the first attemptable session
            if (index > attemptIndex) {
                return (
                    <div key={`locked-${index}`} className='locked-card-view-all'>
                        <div className='card-title'>
                            <span>Dialogue</span>
                            <h2>{session.sessionTitle}</h2>
                            <p>Technical</p>
                        </div>
                        <div className='card-img-roadmap-view-all'>
                            {/* <FaLock /> */}
                        </div>
                        <div className='locked-btn'>
                            <button onClick={handleNotifyClick} className="cursor-pointer">
                                Notify Me
                            </button>
                        </div>
                    </div>
                );
            }

            // ATTEMPT CARD (first incomplete and unlocked session)
            if (index === attemptIndex) {
                return (
                    <React.Fragment key={`attempt-${index}`}>
                        {/* {showPersonaPopup && (
                            <PersonaPop
                                sessionData={selectedSession}
                                onClose={() => setShowPersonaPopup(false)}
                            />
                        )} */}

                        <div className='fst-card-view-all'>
                            <div className='card-title'>
                                <div className='card-title-view-all-header'>
                                    <span>Dialogue</span>
                                    <span className='total-days-view-all'>{index + 1}/</span>
                                </div>
                                <h2>{session.sessionTitle}</h2>
                            </div>
                            <div className='card-img-roadmap-view-all'>
                                {/* <img src={card_img} alt="Interview Card" /> */}
                            </div>
                            <div className='card-btn'>
                                 <button
                                onClick={() => markSessionComplete(index)}
                                className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                            >Attemp Now</button>
                            </div>
                        </div>
                    </React.Fragment>
                );
            }

            // VIEW REPORT card (completed sessions before the attemptIndex)
            return (
                <div key={`report-${index}`} className='report-card-view-all'>
                    <div className='report-card-view-all-header'>
                        <div className='card-title'>
                            <div className='card-title-view-all-header'>
                                <span>Dialogue</span>
                                <span className='total-days-view-all'>{index + 1}/{totalSessions}</span>
                            </div>
                            <h2>{session.sessionTitle}</h2>
                        </div>
                    </div>
                    <div className='progress-circles'>
                        <div className='progress-circle'>
                            <div className='circle technical'>
                                <span>83%</span>
                            </div>
                        </div>
                    </div>
                    <div className='report-card-view-all-btn'>
                        <button>View Report</button>
                    </div>
                </div>
            );
        });


        return (
            <div className="card-column-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="progress-container-guided-view-all">
                    <svg className="progress-circle-meter" width="65" height="65" viewBox="0 0 36 36">
                        <circle className="progress-bg" cx="18" cy="18" r="16"></circle>
                        <circle
                            className="progress-bar-meter"
                            cx="18" cy="18" r="16"
                            strokeDasharray="100"
                            strokeDashoffset="75"
                            transform="rotate(-90 18 18)"
                        ></circle>
                        <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="progress-text">
                            2/{selectedDays}
                        </text>
                    </svg>
                </div>
                <div className="vertical-progress-connector" style={{ position: 'relative', height: '40px', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                    <svg
                        width="30"
                        height="30"
                        style={{ position: 'absolute', top: '0' }}
                    >
                        <line
                            x1="15"
                            y1="0"
                            x2="15"
                            y2="50"
                            stroke="#28a745"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                {allCards.map((card, index) => (
                    <div key={`card-${index}`} className="card-wrapper" style={{ position: 'relative', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {card}
                        {index < allCards.length - 1 && (
                            <div className="vertical-progress-connector" style={{ position: 'relative', height: '100px', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                                <svg
                                    width="30"
                                    height="100"
                                    style={{ position: 'absolute', top: '10' }}
                                >
                                    <line
                                        x1="15"
                                        y1="0"
                                        x2="15"
                                        y2="100"
                                        stroke={roadmapData[index]?.isComplete ? '#28a745' : '#ccc'}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                    />
                                    <circle cx="15" cy="50" r="15" fill={roadmapData[index]?.isComplete ? '#28a745' : '#F6F6F6'} stroke="#fff" strokeWidth="3" />
                                    <foreignObject x="8" y="40" width="20" height="20">
                                        <FaCheck
                                            style={{
                                                color: index < 2 ? '#fff' : '#E0E3E5',
                                                fontSize: '14px',
                                            }}
                                        />
                                    </foreignObject>
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const selectedOption = dropdownOptions.find((opt) => opt.value === selectedDays);
    let selectedDisplay;
    if (selectedOption && selectedOption.type === 'roadmap') {
        selectedDisplay = (
            <>
                <span className="number-circle-select">{selectedOption.number}</span>
                <span>{selectedOption.text}</span>
            </>
        );
    } else {
        selectedDisplay = 'Select Roadmap';
    }

    return (
        <div className='main-roadmap-view-all'>
            <div className="roadmap-view-all-header">
                <div className="roadmap-view-all-content">
                    <h1>Guided Roadmap</h1>
                    <p>A personalized skill journey based on your role and growth areas</p>
                </div>
                <div className='right-roadmap-view-all-content'>
                    <div className='dropdown-container-select-job-role' ref={dropdownRef}>
                        <div
                            className={`view-all-dropdown-job-role ${isDropdownOpen ? 'open' : ''}`}
                            onClick={toggleDropdown}
                            style={{ minWidth: '0', width: 'auto' }}
                        >
                            {selectedDisplay}
                            <FaAngleDown className='dropdown-icon-job-role' />
                        </div>
                        <ul className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                            {dropdownOptions.map((option) => {
                                let displayContent;
                                if (option.type === 'roadmap') {
                                    displayContent = (
                                        <>
                                            <span className="number-circle">{option.number}</span>
                                            <span>{option.text}</span>
                                            <span
                                                className="delete-circle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOption(option.value);
                                                }}
                                            >
                                                <MdDeleteOutline size={20} />
                                            </span>
                                        </>
                                    );
                                } else {
                                    displayContent = (
                                        <>
                                            <span className="plus-circle">
                                                <FaPlus />
                                            </span>
                                            <span>{option.label}</span>
                                        </>
                                    );
                                }
                                return (
                                    <li
                                        key={option.value}
                                        className={`dropdown-item ${option.type === 'add-new' ? 'add-new-option' : 'roadmap-option'}`}
                                        onClick={() => handleDaysChange(option.value)}
                                    >
                                        {displayContent}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            <div className='learning-roadmap-view-all-container'>
                <div className='guided-roadmap-fst-section'>
                    {renderCards()}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            onClick={() => setShowModal(false)}
                            className="modal-close-btn"
                            aria-label="Close modal"
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
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const newValue = parseInt(scheduleDate.day || 0) + (e.deltaY > 0 ? -1 : 1);
                                        if (newValue >= 1 && newValue <= 31) {
                                            setScheduleDate({ ...scheduleDate, day: newValue.toString() });
                                        }
                                    }}
                                    className="date-input"
                                    placeholder="DD"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={scheduleDate.month}
                                    onChange={(e) => setScheduleDate({ ...scheduleDate, month: e.target.value })}
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const newValue = parseInt(scheduleDate.month || 0) + (e.deltaY > 0 ? -1 : 1);
                                        if (newValue >= 1 && newValue <= 12) {
                                            setScheduleDate({ ...scheduleDate, month: newValue.toString() });
                                        }
                                    }}
                                    className="date-input"
                                    placeholder="MM"
                                />
                                <input
                                    type="number"
                                    min="2025"
                                    value={scheduleDate.year}
                                    onChange={(e) => setScheduleDate({ ...scheduleDate, year: e.target.value })}
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const newValue = parseInt(scheduleDate.year || 2025) + (e.deltaY > 0 ? -1 : 1);
                                        if (newValue >= 2025) {
                                            setScheduleDate({ ...scheduleDate, year: newValue.toString() });
                                        }
                                    }}
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
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const newValue = parseInt(scheduleTime.hours || 0) + (e.deltaY > 0 ? -1 : 1);
                                        if (newValue >= 1 && newValue <= 12) {
                                            setScheduleTime({ ...scheduleTime, hours: newValue.toString() });
                                        }
                                    }}
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
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const newValue = parseInt(scheduleTime.minutes || 0) + (e.deltaY > 0 ? -1 : 1);
                                        if (newValue >= 0 && newValue <= 59) {
                                            setScheduleTime({ ...scheduleTime, minutes: newValue.toString() });
                                        }
                                    }}
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
                        {message && <p className="error-message">{message}</p>}
                        <div className="modal-delete-buttons">
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

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content-guided">
                        <button
                            onClick={handleClosePopup}
                            className="popup-close-btn-guided"
                            aria-label="Close popup"
                        >
                            <RxCross1 />
                        </button>
                        <GuidedRoadmapPopup />
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={cancelDelete} className="modal-close-btn" aria-label="Close modal">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="modal-title">Delete Roadmap</h2>
                        <p>Deleting this roadmap will remove all progress and access</p>
                        <h2 className="modal-title">Are you sure you want to continue?</h2>
                        <p>This roadmap cannot be restored once deleted</p>
                        <div className="modal-delete-buttons">
                            <button onClick={confirmDelete} className="schedule-button-delete">
                                Yes, Delete
                            </button>
                            <button onClick={cancelDelete} className="schedule-button-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuidedRoadmapViewAllSingle;
