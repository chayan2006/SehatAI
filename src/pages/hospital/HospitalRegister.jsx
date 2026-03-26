/**
 * HospitalRegister.jsx
 *
 * Multi-step hospital onboarding / registration flow.
 * Steps: Basic Info → Location → Contact → Infrastructure → Verification
 * Validation: each field is validated before allowing progression to the next step.
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import './HospitalRegister.css';

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'basic',          label: 'Basic Info',      icon: '🏥' },
  { id: 'location',       label: 'Location',         icon: '📍' },
  { id: 'contact',        label: 'Contact',          icon: '📞' },
  { id: 'infrastructure', label: 'Infrastructure',   icon: '🏗️' },
  { id: 'verification',   label: 'Verification',     icon: '🛡️' },
];

const ESTABLISHMENT_TYPES = ['Government', 'Private', 'NGO', 'Public-Private'];
const DEPARTMENTS = [
  'Emergency', 'Cardiology', 'Neurology', 'Oncology',
  'Pediatrics', 'Trauma', 'Radiology', 'Surgery', 'Orthopedics', 'Psychiatry',
];

// ─── Validators per step ──────────────────────────────────────────────────────
function validateBasic(data) {
  const errors = {};
  if (!data.name.trim())      errors.name      = 'Hospital name is required.';
  if (!data.licenseNo.trim()) errors.licenseNo = 'Registration/License number is required.';
  if (!data.type)             errors.type      = 'Please select an establishment type.';
  return errors;
}

function validateLocation(data) {
  const errors = {};
  if (!data.address.trim()) errors.address = 'Full address is required.';
  if (!data.city.trim())    errors.city    = 'City is required.';
  if (!data.state.trim())   errors.state   = 'State is required.';
  if (!data.pin.trim())     errors.pin     = 'PIN Code is required.';
  else if (!/^\d{6}$/.test(data.pin.trim())) errors.pin = 'Enter a valid 6-digit PIN code.';
  return errors;
}

function validateContact(data) {
  const errors = {};
  if (!data.email.trim())   errors.email   = 'Official email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.hotline.trim()) errors.hotline = 'Emergency hotline is required.';
  if (!data.phone.trim())   errors.phone   = 'Phone number is required.';
  return errors;
}

function validateInfra(data) {
  const errors = {};
  if (!data.totalBeds || data.totalBeds <= 0) errors.totalBeds = 'Enter total bed capacity (must be > 0).';
  if (data.icuBeds === '' || data.icuBeds < 0) errors.icuBeds  = 'Enter available ICU beds (0 or more).';
  if (!data.departments || data.departments.length === 0)
    errors.departments = 'Select at least one specialized department.';
  return errors;
}

function validateVerify(data) {
  const errors = {};
  if (!data.licenseFile)  errors.licenseFile = 'Please upload your Hospital License document.';
  if (!data.accredFile)   errors.accredFile  = 'Please upload an Accreditation document.';
  if (!data.compliance)   errors.compliance  = 'You must certify that all information is accurate.';
  return errors;
}

const VALIDATORS = [validateBasic, validateLocation, validateContact, validateInfra, validateVerify];

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepBar({ currentStep }) {
  return (
    <div className="hr-stepbar">
      {STEPS.map((step, idx) => {
        const done   = idx < currentStep;
        const active = idx === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className={`hr-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
              <div className="hr-step-circle">
                {done
                  ? <span className="hr-check">✓</span>
                  : <span className="hr-step-icon">{step.icon}</span>
                }
              </div>
              <span className="hr-step-label">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`hr-connector ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Field with error support ─────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="hr-field">
      <label className="hr-label">{label}</label>
      {children}
      {error && <span className="hr-field-error">⚠ {error}</span>}
    </div>
  );
}

function Input({ icon, hasError, ...props }) {
  return (
    <div className="hr-input-wrap">
      {icon && <span className="hr-input-icon">{icon}</span>}
      <input className={`hr-input ${icon ? 'has-icon' : ''} ${hasError ? 'input-error' : ''}`} {...props} />
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function StepBasicInfo({ data, setData, errors }) {
  return (
    <div className="hr-card-body">
      <h2 className="hr-card-title">Facility Basics</h2>
      <p className="hr-card-sub">Start with the fundamental details of your hospital.</p>

      <div className="hr-grid-2">
        <Field label="Hospital Name *" error={errors.name}>
          <Input icon="🏥" type="text" placeholder="City General Hospital" hasError={!!errors.name}
            value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
        </Field>
        <Field label="Registration ID / License No. *" error={errors.licenseNo}>
          <Input icon="🪪" type="text" placeholder="HOSP-2024-7XXX" hasError={!!errors.licenseNo}
            value={data.licenseNo} onChange={e => setData({ ...data, licenseNo: e.target.value })} />
        </Field>
      </div>

      <Field label="Establishment Type *" error={errors.type}>
        <div className={`hr-pill-group ${errors.type ? 'group-error' : ''}`}>
          {ESTABLISHMENT_TYPES.map(type => (
            <button
              key={type} type="button"
              onClick={() => setData({ ...data, type })}
              className={`hr-pill ${data.type === type ? 'selected' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── Step 2: Location ─────────────────────────────────────────────────────────
function StepLocation({ data, setData, errors }) {
  return (
    <div className="hr-card-body">
      <h2 className="hr-card-title">Location Details</h2>
      <p className="hr-card-sub">Where is your hospital located?</p>

      <Field label="Full Address *" error={errors.address}>
        <Input icon="🗺️" type="text" placeholder="Street, Landmark, Area" hasError={!!errors.address}
          value={data.address} onChange={e => setData({ ...data, address: e.target.value })} />
      </Field>

      <div className="hr-grid-3">
        <Field label="City *" error={errors.city}>
          <Input type="text" placeholder="New Delhi" hasError={!!errors.city}
            value={data.city} onChange={e => setData({ ...data, city: e.target.value })} />
        </Field>
        <Field label="State *" error={errors.state}>
          <Input type="text" placeholder="Delhi" hasError={!!errors.state}
            value={data.state} onChange={e => setData({ ...data, state: e.target.value })} />
        </Field>
        <Field label="PIN Code *" error={errors.pin}>
          <Input type="text" placeholder="110001" hasError={!!errors.pin}
            value={data.pin} onChange={e => setData({ ...data, pin: e.target.value })} />
        </Field>
      </div>

      <div className="hr-info-banner">
        <span className="hr-info-icon">ℹ️</span>
        <p>Accurate location data helps SehatAI calculate real-time emergency travel duration for ambulances and donors.</p>
      </div>
    </div>
  );
}

// ─── Step 3: Contact ──────────────────────────────────────────────────────────
function StepContact({ data, setData, errors }) {
  return (
    <div className="hr-card-body">
      <h2 className="hr-card-title">Communication</h2>
      <p className="hr-card-sub">How should donors and the network reach you?</p>

      <div className="hr-grid-2">
        <Field label="Official Email *" error={errors.email}>
          <Input icon="✉️" type="email" placeholder="contact@hospital.com" hasError={!!errors.email}
            value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
        </Field>
        <Field label="Emergency Hotline (24/7) *" error={errors.hotline}>
          <div className={`hr-input-wrap emergency ${errors.hotline ? 'input-error' : ''}`}>
            <span className="hr-emr-badge">🚨</span>
            <input className="hr-input has-icon emr" type="tel" placeholder="+91-XXXX-XXXXXX"
              value={data.hotline} onChange={e => setData({ ...data, hotline: e.target.value })} />
          </div>
        </Field>
        <Field label="Phone Number *" error={errors.phone}>
          <Input icon="📱" type="tel" placeholder="+91 XXXX XXXXXX" hasError={!!errors.phone}
            value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
        </Field>
        <Field label="Website (Optional)">
          <Input icon="🌐" type="url" placeholder="https://www.hospital.com"
            value={data.website} onChange={e => setData({ ...data, website: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 4: Infrastructure ───────────────────────────────────────────────────
function StepInfrastructure({ data, setData, errors }) {
  const toggleDept = (dept) => {
    const depts = data.departments || [];
    setData({
      ...data,
      departments: depts.includes(dept)
        ? depts.filter(d => d !== dept)
        : [...depts, dept],
    });
  };

  return (
    <div className="hr-card-body">
      <h2 className="hr-card-title">Medical Infrastructure</h2>
      <p className="hr-card-sub">Verify your capacity for handling donors and patients.</p>

      <div className="hr-grid-2">
        {/* Beds Card */}
        <div className={`hr-infra-card ${(errors.totalBeds || errors.icuBeds) ? 'card-error' : ''}`}>
          <div className="hr-infra-header">
            <span>🛏️</span>
            <span>BEDS &amp; CAPACITY</span>
          </div>
          <Field label="Total Bed Capacity *" error={errors.totalBeds}>
            <Input type="number" min="1" placeholder="e.g. 200" hasError={!!errors.totalBeds}
              value={data.totalBeds} onChange={e => setData({ ...data, totalBeds: e.target.value })} />
          </Field>
          <Field label="Available ICU Beds *" error={errors.icuBeds}>
            <Input type="number" min="0" placeholder="e.g. 20" hasError={!!errors.icuBeds}
              value={data.icuBeds} onChange={e => setData({ ...data, icuBeds: e.target.value })} />
          </Field>
        </div>

        {/* Blood Bank Card */}
        <div className="hr-infra-card blood">
          <div className="hr-infra-header blood">
            <span>🩸</span>
            <span>BLOOD BANK SERVICES</span>
          </div>
          <p className="hr-infra-sub">Official Blood Bank Support?</p>
          <div className="hr-toggle-pair">
            <button type="button"
              onClick={() => setData({ ...data, bloodBank: true })}
              className={`hr-toggle-btn ${data.bloodBank === true ? 'off' : 'yes'}`}>
              Yes
            </button>
            <button type="button"
              onClick={() => setData({ ...data, bloodBank: false })}
              className={`hr-toggle-btn ${data.bloodBank === false ? 'active-no' : 'no'}`}>
              No
            </button>
          </div>
        </div>
      </div>

      <Field label="Specialized Departments *" error={errors.departments}>
        <div className={`hr-tag-group ${errors.departments ? 'group-error' : ''}`}>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept} type="button"
              onClick={() => toggleDept(dept)}
              className={`hr-tag ${(data.departments || []).includes(dept) ? 'selected' : ''}`}
            >
              {dept}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── Step 5: Verification ─────────────────────────────────────────────────────
function StepVerification({ data, setData, errors }) {
  const licenseRef = useRef();
  const accredRef  = useRef();

  return (
    <div className="hr-card-body">
      <h2 className="hr-card-title">Final Verification</h2>
      <p className="hr-card-sub">Upload necessary accreditation documents to go live.</p>

      <div className="hr-grid-2">
        {/* Hospital License Upload */}
        <div>
          <div
            className={`hr-upload-zone ${errors.licenseFile ? 'upload-error' : ''} ${data.licenseFile ? 'upload-done' : ''}`}
            onClick={() => licenseRef.current.click()}
          >
            <input ref={licenseRef} type="file" accept=".pdf,.jpg,.png" hidden
              onChange={e => setData({ ...data, licenseFile: e.target.files[0] })} />
            <div className="hr-upload-icon">{data.licenseFile ? '✅' : '📄'}</div>
            <p className="hr-upload-title">
              {data.licenseFile ? data.licenseFile.name : 'Hospital License'}
            </p>
            <p className="hr-upload-hint">PDF, JPG UP TO 10MB</p>
          </div>
          {errors.licenseFile && <span className="hr-field-error">⚠ {errors.licenseFile}</span>}
        </div>

        {/* Accreditation Upload */}
        <div>
          <div
            className={`hr-upload-zone ${errors.accredFile ? 'upload-error' : ''} ${data.accredFile ? 'upload-done' : ''}`}
            onClick={() => accredRef.current.click()}
          >
            <input ref={accredRef} type="file" accept=".pdf,.jpg,.png" hidden
              onChange={e => setData({ ...data, accredFile: e.target.files[0] })} />
            <div className="hr-upload-icon">{data.accredFile ? '✅' : '🏅'}</div>
            <p className="hr-upload-title">
              {data.accredFile ? data.accredFile.name : 'Accreditation (NABH/JCI)'}
            </p>
            <p className="hr-upload-hint">CERTIFICATION DOCUMENT</p>
          </div>
          {errors.accredFile && <span className="hr-field-error">⚠ {errors.accredFile}</span>}
        </div>
      </div>

      {/* Compliance Banner */}
      <div className={`hr-compliance ${errors.compliance ? 'compliance-error' : ''}`}>
        <div className="hr-compliance-left">
          <span className="hr-compliance-icon">🛡️</span>
          <div>
            <p className="hr-compliance-title">Compliance Statement</p>
            <p className="hr-compliance-sub">I CERTIFY THAT ALL PROVIDED INFORMATION IS ACCURATE</p>
          </div>
        </div>
        <input type="checkbox" className="hr-checkbox"
          checked={data.compliance || false}
          onChange={e => setData({ ...data, compliance: e.target.checked })} />
      </div>
      {errors.compliance && <span className="hr-field-error">⚠ {errors.compliance}</span>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HospitalRegister() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state per step
  const [basic, setBasic]       = useState({ name: '', licenseNo: '', type: '' });
  const [location, setLocation] = useState({ address: '', city: '', state: '', pin: '' });
  const [contact, setContact]   = useState({ email: '', hotline: '', phone: '', website: '' });
  const [infra, setInfra]       = useState({ totalBeds: '', icuBeds: '', bloodBank: false, departments: [] });
  const [verify, setVerify]     = useState({ licenseFile: null, accredFile: null, compliance: false });

  const stepData = [basic, location, contact, infra, verify];

  const handleContinue = () => {
    const currentErrors = VALIDATORS[step](stepData[step]);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      // Scroll to top of card to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
      // TODO: submit to Supabase
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 0) navigate('/');
    else setStep(s => s - 1);
  };

  // Clear individual field error when data changes
  const makeSetBasic    = (d) => { setBasic(d);    setErrors({}); };
  const makeSetLocation = (d) => { setLocation(d); setErrors({}); };
  const makeSetContact  = (d) => { setContact(d);  setErrors({}); };
  const makeSetInfra    = (d) => { setInfra(d);    setErrors({}); };
  const makeSetVerify   = (d) => { setVerify(d);   setErrors({}); };

  if (done) {
    return (
      <div className="hr-root">
        <div className="hr-success-card">
          <div className="hr-success-icon">✅</div>
          <h2 className="hr-success-title">Registration Submitted!</h2>
          <p className="hr-success-sub">Your hospital profile is under review. We'll notify you within 24-48 hours.</p>
          <button className="hr-btn-continue" onClick={async () => { await logout(); navigate('/'); }}>
            Back to Home →
          </button>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="hr-root">
      {/* Header */}
      <div className="hr-header">
        <div className="hr-logo">
          <span className="hr-logo-mark">S</span>
          <span className="hr-logo-text">SehatAI <span>Hospital Onboarding</span></span>
        </div>
      </div>

      <div className="hr-container">
        {/* Step Progress */}
        <div className="hr-stepbar-wrap">
          <StepBar currentStep={step} />
        </div>

        {/* Global error banner */}
        {hasErrors && (
          <div className="hr-error-banner">
            <span>⚠️</span>
            <span>Please fill in all required fields before continuing.</span>
          </div>
        )}

        {/* Step Card */}
        <div className="hr-card">
          {step === 0 && <StepBasicInfo    data={basic}    setData={makeSetBasic}    errors={errors} />}
          {step === 1 && <StepLocation     data={location} setData={makeSetLocation} errors={errors} />}
          {step === 2 && <StepContact      data={contact}  setData={makeSetContact}  errors={errors} />}
          {step === 3 && <StepInfrastructure data={infra}  setData={makeSetInfra}    errors={errors} />}
          {step === 4 && <StepVerification data={verify}   setData={makeSetVerify}   errors={errors} />}

          {/* Navigation */}
          <div className="hr-card-footer">
            <button className="hr-btn-back" onClick={handleBack}>
              ← Back
            </button>
            <button className="hr-btn-continue" onClick={handleContinue}>
              {step === STEPS.length - 1 ? 'Complete Onboarding ✔✔' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
