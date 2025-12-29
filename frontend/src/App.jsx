import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import OwnerCar from './OwnerCar'
import LaborsProfit from './LaborsProfit'

/* ================= LOGIN PAGE ================= */
function Login({ setAuth }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    if (username === 'Muzammil' && password === '1234') {
      setAuth(true)
      navigate('/')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.heroImage} />

      <div style={styles.loginOverlay}>
        <h1 style={styles.pageTitle}>Welcome Back</h1>
        <p style={styles.pageSubtitle}>
          Sign in to manage your AutoFix Workshop
        </p>

        {error && <p style={styles.errorMessage}>{error}</p>}

        <div style={styles.formGroup}>
          <label style={styles.inputLabel}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.inputField}
            placeholder="Enter username"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.inputLabel}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.inputField}
            placeholder="Enter password"
          />
        </div>

        <button
          onClick={handleLogin}
          style={styles.actionButton}
        >
          Login to Dashboard →
        </button>
      </div>
    </div>
  )
}

/* ================= HOME PAGE ================= */
function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.pageContainer}>
      <div style={styles.heroImage} />

      <div style={styles.overlay}>
        <h1 style={styles.pageTitle}>AutoFix Workshop</h1>

        <p style={styles.pageSubtitle}>
          Professional car repair & diagnostics — we handle everything from engine troubleshooting
          to suspension, brakes, electrical systems and full restorations.
        </p>

        <div style={styles.servicesList}>
          <div style={styles.serviceItem}>🔧 Engine & Transmission Repair</div>
          <div style={styles.serviceItem}>⚡ Electrical & Diagnostic Scanning</div>
          <div style={styles.serviceItem}>🛠️ Suspension, Brakes & Alignment</div>
          <div style={styles.serviceItem}>🚗 Body Work & Painting</div>
          <div style={styles.serviceItem}>📊 Detailed Repair Reports & Photos</div>
        </div>

        <p style={styles.extraText}>
          Fast, reliable service with expert mechanics using modern tools and genuine parts.<br />
          Your car leaves better than it arrived — every time.
        </p>

        <button
          style={styles.actionButton}
          onClick={() => navigate('/add-details')}
        >
          Start Now — Add Owner & Car Details →
        </button>
      </div>
    </div>
  )
}

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ auth, children }) {
  if (!auth) return <Navigate to="/login" replace />
  return children
}

/* ================= APP ================= */
function App() {
  const [auth, setAuth] = useState(false)

  return (
    <Routes>
      <Route path="/login" element={<Login setAuth={setAuth} />} />

      <Route
        path="/"
        element={
          <ProtectedRoute auth={auth}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-details"
        element={
          <ProtectedRoute auth={auth}>
            <OwnerCar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/labors-profit/:jobId"
        element={
          <ProtectedRoute auth={auth}>
            <LaborsProfit />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

/* ================= SHARED STYLES ================= */
const styles = {
  // ── Shared base for both pages ─────────────────────────────
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

  // ── Login specific ─────────────────────────────────────────
  loginOverlay: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(30, 41, 59, 0.78)',
    backdropFilter: 'blur(16px)',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    margin: '20px',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    textAlign: 'center',
  },

  // ── Home specific ──────────────────────────────────────────
  overlay: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(30, 41, 59, 0.78)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '60px 48px',
    maxWidth: '820px',
    width: '90%',
    margin: '20px',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    textAlign: 'center',
  },

  // ── Shared typography & elements ───────────────────────────
  pageTitle: {
    margin: '0 0 16px 0',
    fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#f8fafc',
    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },

  pageSubtitle: {
    margin: '0 0 32px 0',
    fontSize: '1.25rem',
    color: '#cbd5e1',
    lineHeight: 1.6,
    maxWidth: '640px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  errorMessage: {
    color: '#f87171',
    margin: '0 0 24px 0',
    fontSize: '1rem',
    background: 'rgba(248,113,113,0.15)',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(248,113,113,0.3)',
  },

  formGroup: {
    margin: '20px 0',
    textAlign: 'left',
  },

  inputLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#e2e8f0',
  },

  inputField: {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(51,65,85,0.55)',
    color: '#f1f5f9',
    fontSize: '1.05rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
  },

  actionButton: {
    marginTop: '28px',
    padding: '18px 36px',
    width: '100%',
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#ffffff',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
  },

  // Home-only styles (kept from your previous version)
  servicesList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '14px',
    margin: '0 0 36px 0',
  },

  serviceItem: {
    background: 'rgba(255,255,255,0.08)',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.14)',
  },

  extraText: {
    margin: '0 0 44px 0',
    fontSize: '1.1rem',
    color: '#94a3b8',
    lineHeight: 1.7,
  },
}

// Hover / focus effects
styles.actionButton[':hover'] = {
  transform: 'translateY(-3px)',
  boxShadow: '0 16px 40px rgba(16,185,129,0.55)',
}

styles.inputField[':focus'] = {
  borderColor: '#34d399',
  boxShadow: '0 0 0 3px rgba(52,211,153,0.2), inset 0 2px 6px rgba(0,0,0,0.3)',
}

export default App