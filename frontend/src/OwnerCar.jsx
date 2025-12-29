import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/api.js';

const OwnerCar = () => {
  const [owner, setOwner] = useState({ name: '', phone: '', address: '' });
  const [car, setCar] = useState({ model: '', year: '', license_plate: '' });
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');
  const [lastRepairJobId, setLastRepairJobId] = useState(null);
  const navigate = useNavigate();

  /* ================= SAVE OWNER + CAR ================= */
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const createdOwner = await api.createOwner(owner);
      const createdCar = await api.createCar({
        ...car,
        owner_id: createdOwner.id,
      });

      setMessage(`✅ ${createdOwner.name} & ${createdCar.model} saved successfully`);
      setMsgType('success');

      setOwner({ name: '', phone: '', address: '' });
      setCar({ model: '', year: '', license_plate: '' });

      setLastRepairJobId(createdCar.repair_job_id);
    } catch (error) {
      console.error(error);
      setMessage('⚠️ Backend error');
      setMsgType('error');
    }
  };

  /* ================= NEXT PAGE ================= */
  const handleNext = () => {
    if (lastRepairJobId) {
      navigate(`/labors-profit/${lastRepairJobId}`);
    } else {
      alert("Please save at least one record first.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.heroImage} />

      <div style={styles.formOverlay}>
        <h1 style={styles.pageTitle}>Add Owner & Vehicle</h1>
        <p style={styles.pageSubtitle}>
          Register a new customer and their vehicle to begin a repair job
        </p>

        {message && (
          <div
            style={{
              ...styles.messageBox,
              background: msgType === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)',
              borderColor: msgType === 'success' ? '#10b981' : '#f87171',
              color: msgType === 'success' ? '#10b981' : '#f87171',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={styles.sectionsWrapper}>
            {/* Left: Owner */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionTitle}>1. Owner Information</div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={owner.name}
                  onChange={(e) => setOwner({ ...owner, name: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={owner.phone}
                  onChange={(e) => setOwner({ ...owner, phone: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Address</label>
                <input
                  type="text"
                  placeholder="Full address (optional)"
                  value={owner.address}
                  onChange={(e) => setOwner({ ...owner, address: e.target.value })}
                  style={styles.inputField}
                />
              </div>
            </div>

            {/* Right: Vehicle */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionTitle}>2. Vehicle Information</div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Car Model *</label>
                <input
                  type="text"
                  placeholder="e.g. Honda Civic, Toyota Corolla"
                  value={car.model}
                  onChange={(e) => setCar({ ...car, model: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Year *</label>
                <input
                  type="number"
                  placeholder="e.g. 2023"
                  value={car.year}
                  onChange={(e) => setCar({ ...car, year: e.target.value })}
                  style={styles.inputField}
                  min="1900"
                  max="2030"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>License Plate *</label>
                <input
                  type="text"
                  placeholder="e.g. ABC-1234 or LHR-5678"
                  value={car.license_plate}
                  onChange={(e) => setCar({ ...car, license_plate: e.target.value })}
                  style={styles.inputField}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" style={styles.actionButton}>
            Save Owner & Vehicle
          </button>
        </form>

        <button
          type="button"
          onClick={handleNext}
          style={{
            ...styles.actionButton,
            marginTop: '20px',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          }}
        >
          Next → Go to Labor & Profit Details
        </button>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  pageContainer: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#f1f5f9',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
    padding: '12px',                    // reduced from 16px
  },

  heroImage: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("https://images.stockcake.com/public/4/a/b/4abbd091-073b-4e58-8132-a30f1037c40d_large/mechanic-repairs-car-stockcake.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.22,
    zIndex: 0,
  },

  formOverlay: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(30, 41, 59, 0.78)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',               // slightly smaller radius
    padding: '28px 20px',               // significantly reduced padding
    width: '100%',
    maxWidth: 'min(90vw, 680px)',       // smaller than before (was 800px)
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.45)', // lighter shadow
  },

  sectionsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',                        // reduced from 24px
    marginBottom: '20px',               // reduced from 32px
    flexWrap: 'wrap',
  },

  sectionCard: {
    flex: 1,
    minWidth: '280px',                  // slightly smaller minimum width
    background: 'rgba(40, 51, 71, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '14px',
    padding: '20px 22px',               // reduced padding inside each card
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
  },

  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: 'clamp(1.6rem, 4.5vw, 2.3rem)', // smaller title
    fontWeight: 700,
    color: '#f8fafc',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },

  pageSubtitle: {
    margin: '0 0 20px 0',
    fontSize: '1rem',                   // smaller subtitle
    color: '#cbd5e1',
    lineHeight: 1.4,
  },

  sectionTitle: {
    fontSize: '1.2rem',                 // smaller section headings
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '16px',
    textAlign: 'left',
  },

  messageBox: {
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid',
    fontWeight: 500,
    textAlign: 'center',
    fontSize: '0.95rem',
  },

  formGroup: {
    marginBottom: '14px',               // tighter spacing between fields
  },

  inputLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#e2e8f0',
  },

  inputField: {
    width: '100%',
    padding: '12px 14px',               // smaller input padding
    borderRadius: '10px',
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(51,65,85,0.55)',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25)',
  },

  actionButton: {
    marginTop: '10px',
    padding: '14px 28px',               // smaller button padding
    width: '100%',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
  },
};

// Hover / focus effects
styles.actionButton[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 30px rgba(16,185,129,0.5)',
};

styles.inputField[':focus'] = {
  borderColor: '#34d399',
  boxShadow: '0 0 0 3px rgba(52,211,153,0.18), inset 0 2px 4px rgba(0,0,0,0.25)',
};
export default OwnerCar;