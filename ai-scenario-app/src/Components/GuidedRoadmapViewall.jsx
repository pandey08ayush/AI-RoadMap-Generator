import React, { useState, useEffect } from 'react';
import '../Components/Guided.css';
// import card_img from '../assets/interview-card.png';
// import { BsFillBellFill } from "react-icons/bs";
import axios from 'axios';
import GuidedRoadmapPopup from './GuidedRodmapPopup';

// import { FaAngleDown } from "react-icons/fa6";




const GuidedRoadmapViewAll = () => {
    const [userId, setUserId] = useState('');
    const [scheduleDate, setScheduleDate] = useState({ day: '', month: '', year: '' });
    const [scheduleTime, setScheduleTime] = useState({ hours: '', minutes: '', period: 'AM' });
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDays, setSelectedDays] = useState(7);
    const [showPopup, setShowPopup] = useState(false); // State to toggle popup
    const [roadmapData, setRoadmapData] = useState([]);
    const [totalSessions, setTotalSessions] = useState(0);

    // const { user } = useAuth();
    const roadmapId = "6884d94ec6b8a159a9abf427"


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
            setRoadmapData(res.data.roadmap);
            setTotalSessions(res.data.roadmap.length);
            console.log("Fetched roadmap data:", res.data.roadmap);
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
            console.log('Marked as complete:', res.data);
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

    const handleDaysChange = (e) => {
        const value = e.target.value;
        if (value === 'add-new') {
            setShowPopup(true);
            // Reset to default value to avoid keeping 'add-new' selected
            setSelectedDays(7);
        } else {
            setSelectedDays(parseInt(value));
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const renderCards = () => {
        const totalCards = selectedDays;

        const attemptIndex = roadmapData.findIndex(
            (session) => !session.isLocked && !session.isComplete
        );

        const allCards = roadmapData.map((session, index) => {
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
                    <div key={`attempt-${index}`} className='fst-card-view-all'>
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
                            >
                                Attempt Now
                            </button>
                        </div>
                    </div>
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


        // Group cards into rows of 3
        const rows = [];

        for (let i = 0; i < allCards.length; i += 3) {
            let rowCards = allCards.slice(i, i + 3);
            if (Math.floor(i / 3) % 2 === 1) {
                rowCards = rowCards.reverse();
            }
            const row = (
                <div key={`row-${i}`} className="card-row-wrapper">
                    {i === 0 && (
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
                    )}
                    <div className="card-row" style={{ position: 'relative' }}>
                        {rowCards.map((card, index) => {
                            const visualIndexInRow = index;
                            const isOddRow = Math.floor(i / 3) % 2 === 1;
                            const actualIndexInAllCards = isOddRow
                                ? i + (rowCards.length - 1 - visualIndexInRow)
                                : i + visualIndexInRow;

                            const firstAttemptIndex = roadmapData.findIndex(session => !session.isComplete);
                            const shouldBeGreen = actualIndexInAllCards < firstAttemptIndex;

                            return (
                                <React.Fragment key={index}>
                                    {card}

                                    {/* Middle progress lines */}
                                    {index < rowCards.length - 1 && (
                                        <div className={`progress-line-guided-view-all ${shouldBeGreen ? 'green-progress' : ''}`}>
                                            <div
                                                className="progress-circle-guided-view-all"
                                                style={{ background: shouldBeGreen ? '#28a745' : '#F6F6F6' }}
                                            />
                                        </div>
                                    )}

                                    {/* Right-side outward line for last card */}

                                    {index === rowCards.length - 1 && shouldBeGreen && (
                                        <svg
                                            className="outward-line"
                                            width="80"
                                            height="230"
                                            style={{ position: 'absolute', right: '-80px', top: '-10px' }}
                                        >
                                            <line
                                                x1="10"
                                                y1="50%"
                                                x2="60"
                                                y2="50%"
                                                stroke="#ccc"
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}

                                    {/* Left-side outward line for first card on even rows (i.e. second visual row) */}
                                    {i >= 3 && index === 0 && shouldBeGreen && (
                                        <svg
                                            className="left-outward-line"
                                            width="80"
                                            height="230"
                                            style={{ position: 'absolute', left: '-70px', top: '-10px' }}
                                        >
                                            <line
                                                x1="60"
                                                y1="50%"
                                                x2="10"
                                                y2="50%"
                                                stroke="#ccc"
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {i === 0 && (
                        <div className="progress-line-after-meter">
                            {/* Optional: Add content if needed */}
                        </div>
                    )}
                    {/* Vertical connector for odd-numbered rows (right to right) */}

                    {(i / 3) % 2 === 0 && i + 3 < allCards.length && (
                        <div className="vertical-connector" style={{ position: 'relative' }}>
                            <svg
                                width="60"
                                height="270"
                                style={{ position: 'absolute', right: '-91px', top: '-95px' }}
                            >
                                <line
                                    x1="30"
                                    y1="0"
                                    x2="30"
                                    y2="270"
                                    stroke="#ccc"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                />
                                <circle cx="30" cy="135" r="20" fill="#F6F6F6" stroke="#fff" strokeWidth="2" />
                                <foreignObject x="22" y="127" width="16" height="16">
                                    {/* <FaCheck style={{ color: '#E0E3E5', fontSize: '16px' }} /> */}
                                </foreignObject>
                            </svg>
                        </div>
                    )}
                    {/* Vertical connector for even-numbered rows (left to left) */}

                    {(i / 3) % 2 === 1 && i + 3 < allCards.length && (
                        <div className="vertical-connector" style={{ position: 'relative' }}>
                            <svg
                                width="60"
                                height="270"
                                style={{ position: 'absolute', left: '-90px', top: '-95px' }}
                            >
                                <line
                                    x1="30"
                                    y1="0"
                                    x2="30"
                                    y2="270"
                                    stroke="#ccc"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                />
                                <circle cx="30" cy="135" r="20" fill="#F6F6F6" stroke="#fff" strokeWidth="2" />
                                <foreignObject x="22" y="127" width="16" height="16">
                                    {/* <FaCheck style={{ color: '#E0E3E5', fontSize: '16px' }} /> */}
                                </foreignObject>
                            </svg>
                        </div>
                    )}
                </div>
            );
            rows.push(row);
        }

        return rows;
    };

    return (
        <div className='main-roadmap-view-all'>
            <div className="roadmap-view-all-header">
                <div className="roadmap-view-all-content">
                    <h1>Guided Roadmap</h1>
                    <p>A personalized skill journey based on your role and growth areas</p>
                </div>
                <div className='right-roadmap-view-all-content'>
                    <div className='dropdown-container-select-job-role'>
                        <select
                            className='view-all-dropdown-job-role'
                            value={selectedDays}
                            onChange={handleDaysChange}
                        >
                            <option value="add-new">Add New Roadmap</option>
                            <option value={3}>3 Software Developer</option>
                            <option value={7}>7 Software Developer</option>
                            <option value={21}>21 Software Developer</option>
                            <option value={30}>30 Software Developer</option>
                            <option value={90}>90 Software Developer</option>
                        </select>
                        {/* <FaAngleDown className='dropdown-icon-job-role' /> */}
                    </div>
                </div>
            </div>
            <div className='guided-roadmap-scrolling-container'>
                <div className='learning-roadmap-view-all-container'>
                    <div className='guided-roadmap-fst-section'>
                        {renderCards()}
                    </div>
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

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content-guided">
                        <button
                            onClick={handleClosePopup}
                            className="popup-close-btn-guided"
                            aria-label="Close popup"
                        >
                            {/* <RxCross1 /> */}


                        </button>
                        <GuidedRoadmapPopup />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuidedRoadmapViewAll;