import React, { useEffect, useState } from 'react';
import './PersonaPopup.css';
import { RxCross2 } from 'react-icons/rx';
import axios from 'axios';

const PersonaPop = ({ onClose, sessionData }) => {
    const [personaDetails, setPersonaDetails] = useState(null);

    useEffect(() => {
        const fetchPersonaDetails = async () => {
            if (!sessionData?.personaId) return;

            try {
                const res = await axios.get(`http://localhost:5000/api/personas/${sessionData.personaId}`);
                setPersonaDetails(res.data);
            } catch (err) {
                console.error("Error fetching persona:", err);
            }
        };

        fetchPersonaDetails();
    }, [sessionData?.personaId]);

    if (!sessionData || !personaDetails) return null;

    const { personaExperience, personaRole, personaBackground } = sessionData;
    const { name, avatar } = personaDetails;

    return (
        <div className='modal-overlay'>
            <div className='modal-card'>
                <button className="modal-close-btn" aria-label='Close' onClick={onClose}>
                    <RxCross2 className="modal-close-icon" />
                </button>

                <div>
                    <h3 className='modal-headline'>
                       {personaRole}
                    </h3>
                    <p className='modal-status-title'>
                        {personaBackground}
                    </p>
                </div>

                <div className='modal-image-container'>
                    <img className='modal-image' src={avatar} alt="Persona" />
                </div>

                <div>
                    <p className='modal-title'>
                        <span id='name'>{name}</span>
                        <span id='experience'>{personaExperience}</span>
                    </p>
                    <p className='modal-subtitle'>
                        {personaRole}
                    </p>
                </div>

                <div className='modal-button-group'>
                    <button className='white-bg-btn button-hover-effect'>Start Now</button>
                    <button className='blue-bg-btn button-hover-effect'>See Plans</button>
                </div>
            </div>
        </div>
    );
};

export default PersonaPop;
