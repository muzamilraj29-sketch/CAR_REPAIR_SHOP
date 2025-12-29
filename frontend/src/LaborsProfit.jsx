import html2pdf from "html2pdf.js";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "./api/api.js";

const LaborsProfit = () => {
  const { jobId } = useParams();

  const [ownerCar, setOwnerCar] = useState({
    owner_name: "", owner_phone: "", owner_address: "",
    car_model: "", car_year: "", license_plate: "",
  });

  const [laborCount, setLaborCount] = useState("");
  const [laborDetails, setLaborDetails] = useState([]);

  const [componentCount, setComponentCount] = useState("");
  const [componentDetails, setComponentDetails] = useState([]);

  const [payment, setPayment] = useState("");
  const [profit, setProfit] = useState(null);
  const [message, setMessage] = useState("");

  /* ================= LOAD FULL JOB ================= */
  const loadJobFull = async () => {
    try {
      const data = await api.getJobFull(jobId);

      if (data.owner && data.car) {
        setOwnerCar({
          owner_name: data.owner.name || "",
          owner_phone: data.owner.phone || "",
          owner_address: data.owner.address || "",
          car_model: data.car.model || "",
          car_year: data.car.year || "",
          license_plate: data.car.license_plate || "",
        });
      }

      if (data.labors) {
        setLaborDetails(data.labors.map(l => ({ name: l.name, price: l.pay })));
        setLaborCount(data.labors.length);
      }

      if (data.components) {
        setComponentDetails(data.components.map(c => ({
          name: c.name, fault: c.fault || "", price: c.price,
        })));
        setComponentCount(data.components.length);
      }

      setPayment(data.totals?.client_payment || "");
      setProfit(data.totals?.profit ?? null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load job data");
    }
  };

  useEffect(() => {
    loadJobFull();
  }, [jobId]);

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = () => {
    const element = document.getElementById("job-summary");

    if (!element) {
      console.error("Summary element not found");
      setMessage("❌ Could not find summary to print");
      return;
    }

    const options = {
      margin:       0.8,                    // better page margins
      filename:     `Job_${jobId}_Summary.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },  // better quality + external images
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  /* ================= LABORS ================= */
const handleLaborCountChange = value => {
  const count = Number(value);
  setLaborCount(value);
  setLaborDetails(prev =>
    count > prev.length
      ? [...prev, ...Array(count - prev.length).fill({ name: "", price: "" })]
      : prev.slice(0, count)
  );
};

const handleLaborChange = (index, field, value) => {
  setLaborDetails(prevDetails =>
    prevDetails.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  );
};

const totalLaborCost = laborDetails.reduce((s, l) => s + Number(l.price || 0), 0);

const handleAddLabor = async () => {
  await api.addLabor({
    job_id: Number(jobId),
    labors: laborDetails.map(l => ({ name: l.name, pay: Number(l.price) }))
  });
  loadJobFull();
};

/* ================= COMPONENTS ================= */
const handleComponentCountChange = value => {
  const count = Number(value);
  setComponentCount(value);
  setComponentDetails(prev =>
    count > prev.length
      ? [...prev, ...Array(count - prev.length).fill({ name: "", fault: "", price: "" })]
      : prev.slice(0, count)
  );
};

const handleComponentChange = (index, field, value) => {
  setComponentDetails(prevDetails =>
    prevDetails.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  );
};

const totalComponentPrice = componentDetails.reduce((s, c) => s + Number(c.price || 0), 0);

const handleAddComponents = async () => {
  for (const c of componentDetails) {
    await api.addComponent({
      job_id: Number(jobId),
      name: c.name,
      fault: c.fault,
      price: Number(c.price),
    });
  }
  loadJobFull();
};

  /* ================= PROFIT ================= */
  const handleCalculateProfit = async () => {
    const res = await api.calculateProfit({ job_id: Number(jobId), payment: Number(payment) });
    setProfit(res.profit);
  };

  /* ================= DELETE ================= */
  const handleDeleteFullJob = async () => {
    if (!window.confirm("Delete entire job?")) return;
    await api.deleteFullJob(jobId);
    window.location.href = "/";
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.heroImage} />

      <div style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Labors, Components & Profit</h1>
        <p style={styles.pageSubtitle}>Job #{jobId} – Manage costs, parts and final profit</p>

        {message && (
          <div style={{
            ...styles.messageBox,
            background: message.includes("✅") ? "rgba(16,185,129,0.2)" : "rgba(248,113,113,0.2)",
            borderColor: message.includes("✅") ? "#10b981" : "#f87171",
            color: message.includes("✅") ? "#10b981" : "#f87171",
          }}>
            {message}
          </div>
        )}

        <div style={styles.twoColumnLayout}>
          {/* LEFT – Forms (Labors / Components / Profit side by side) */}
          <div style={styles.formsColumn}>
            <div style={styles.formsGrid}>
              {/* Labor */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Labors</h3>
                <input
                  type="number"
                  placeholder="Count"
                  value={laborCount}
                  onChange={e => handleLaborCountChange(e.target.value)}
                  style={styles.inputField}
                  min="0"
                />
                {laborDetails.map((l, i) => (
                  <div key={i} style={styles.row}>
                    <input
                      placeholder={`Labor ${i+1}`}
                      value={l.name}
                      onChange={e => handleLaborChange(i, "name", e.target.value)}
                      style={styles.inputField}
                    />
                    <input
                      type="number"
                      placeholder="₹"
                      value={l.price}
                      onChange={e => handleLaborChange(i, "price", e.target.value)}
                      style={styles.inputField}
                    />
                  </div>
                ))}
                {laborDetails.length > 0 && (
                  <p style={styles.total}>Total: ₹{totalLaborCost}</p>
                )}
                <button onClick={handleAddLabor} style={styles.saveButton}>
                  Save Labors
                </button>
              </div>

              {/* Components */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Components</h3>
                <input
                  type="number"
                  placeholder="Count"
                  value={componentCount}
                  onChange={e => handleComponentCountChange(e.target.value)}
                  style={styles.inputField}
                  min="0"
                />
                {componentDetails.map((c, i) => (
                  <div key={i} style={styles.row}>
                    <input
                      placeholder={`Part ${i+1}`}
                      value={c.name}
                      onChange={e => handleComponentChange(i, "name", e.target.value)}
                      style={styles.inputField}
                    />
                    <input
                      placeholder="Fault"
                      value={c.fault}
                      onChange={e => handleComponentChange(i, "fault", e.target.value)}
                      style={styles.inputField}
                    />
                    <input
                      type="number"
                      placeholder="₹"
                      value={c.price}
                      onChange={e => handleComponentChange(i, "price", e.target.value)}
                      style={styles.inputField}
                    />
                  </div>
                ))}
                {componentDetails.length > 0 && (
                  <p style={styles.total}>Total: ₹{totalComponentPrice}</p>
                )}
                <button onClick={handleAddComponents} style={styles.saveButton}>
                  Save Parts
                </button>
              </div>

              {/* Profit */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Profit</h3>
                <input
                  type="number"
                  placeholder="Payment ₹"
                  value={payment}
                  onChange={e => setPayment(e.target.value)}
                  style={styles.inputField}
                />
                <button onClick={handleCalculateProfit} style={styles.calculateButton}>
                  Calculate
                </button>
                {profit !== null && (
                  <p style={styles.profitResult}>Profit: ₹{profit}</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT – Job Summary (this is what will be printed) */}
          <div style={styles.summaryPanel} id="job-summary">
            <h3 style={styles.panelTitle}>Job Summary</h3>

            <div style={styles.summaryBlock}>
              <h4>Owner & Car</h4>
              <p><strong>Owner:</strong> {ownerCar.owner_name || "—"} | {ownerCar.owner_phone || "—"} | {ownerCar.owner_address || "—"}</p>
              <p><strong>Car:</strong> {ownerCar.car_model || "—"} | {ownerCar.car_year || "—"} | {ownerCar.license_plate || "—"}</p>
            </div>

            <div style={styles.summaryBlock}>
              <h4>Labors ({laborDetails.length})</h4>
              {laborDetails.length > 0 ? (
                laborDetails.map((l, i) => (
                  <p key={i}>
                    {i + 1}. {l.name || "Unnamed"} - ₹{l.price || 0}
                  </p>
                ))
              ) : (
                <p>No labors added</p>
              )}
              <p><strong>Total Labor Cost:</strong> ₹{totalLaborCost}</p>
            </div>

            <div style={styles.summaryBlock}>
              <h4>Components ({componentDetails.length})</h4>
              {componentDetails.length > 0 ? (
                componentDetails.map((c, i) => (
                  <p key={i}>
                    {i + 1}. {c.name || "Unnamed"} ({c.fault || "—"}) - ₹{c.price || 0}
                  </p>
                ))
              ) : (
                <p>No components added</p>
              )}
              <p><strong>Total Parts Cost:</strong> ₹{totalComponentPrice}</p>
            </div>

            <div style={styles.summaryBlock}>
              <h4>Payment & Profit</h4>
              <p><strong>Client Payment:</strong> ₹{payment || "—"}</p>
              <p><strong>Profit:</strong> {profit !== null ? `₹${profit}` : "Not calculated yet"}</p>
            </div>

            <button onClick={handleDeleteFullJob} style={styles.deleteButton}>
              Delete Entire Job
            </button>

            {/* Added PDF button here */}
            <button onClick={downloadPDF} style={styles.printButton}>
              Download PDF Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
/* ================= COMPACT STYLES ================= */
const styles = {
  pageContainer: {
    minHeight: '100vh',
    position: 'relative',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#f1f5f9',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '12px',
  },

  heroImage: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("https://images.stockcake.com/public/4/a/b/4abbd091-073b-4e58-8132-a30f1037c40d_large/mechanic-repairs-car-stockcake.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.20,
    zIndex: 0,
  },

  mainContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 'min(94vw, 1000px)',
    margin: '0 auto',
  },

  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: 'clamp(1.7rem, 4.5vw, 2.2rem)',
    fontWeight: 700,
    color: '#f8fafc',
  },

  pageSubtitle: {
    margin: '0 0 16px 0',
    fontSize: '0.95rem',
    color: '#cbd5e1',
  },

  twoColumnLayout: {
    display: 'flex',
    flexDirection: 'row-reverse',  // Summary on RIGHT
    gap: '16px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },

  summaryPanel: {
    flex: '0 0 300px',  // Narrower on right
    background: 'rgba(30, 41, 59, 0.88)',
    backdropFilter: 'blur(14px)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    position: 'sticky',
    top: '12px',
  },

  panelTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#94a3b8',
  },

  summaryBlock: {
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(148,163,184,0.2)',
    fontSize: '0.9rem',
  },

  formsColumn: {
    flex: 1,
  },

  formsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },

  formCard: {
    background: 'rgba(40, 51, 71, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '18px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
  },

  formTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },

  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px',
  },

  inputField: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(51,65,85,0.55)',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25)',
  },

  total: {
    margin: '8px 0',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },

  saveButton: {
    marginTop: '8px',
    padding: '10px',
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
  },

  calculateButton: {
    marginTop: '8px',
    padding: '10px',
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
  },

  profitResult: {
    marginTop: '12px',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#34d399',
    textAlign: 'center',
  },

  messageBox: {
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid',
    fontWeight: 500,
    textAlign: 'center',
    fontSize: '0.9rem',
  },

  deleteButton: {
    marginTop: '10px',
    padding: '8px',
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#fff',
    background: '#e74c3c',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(231,76,60,0.3)',
  },
  

  printButton: {
    marginTop: '12px',
    padding: '10px',
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', // orange/yellow for visibility
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
  },
};

// Hover effects
styles.saveButton[':hover'] = { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(16,185,129,0.45)' };
styles.calculateButton[':hover'] = { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(59,130,246,0.45)' };
styles.deleteButton[':hover'] = { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(231,76,60,0.45)' };

styles.inputField[':focus'] = {
  borderColor: '#34d399',
  boxShadow: '0 0 0 2px rgba(52,211,153,0.2), inset 0 1px 4px rgba(0,0,0,0.25)',
};

export default LaborsProfit;