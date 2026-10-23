import { useState, useRef, useEffect } from "react";
import { User, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { analytics } from "../api/analytics.js";

export default function MonsterAuth({ onClose, onLoginSuccess, _isModal = false, reason = "" }) {
  // mode: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState("login");
  const [animClass, setAnimClass] = useState(""); // 'sweep-to-left' | 'sweep-to-right' | ''
  const [displayedBladeMode, setDisplayedBladeMode] = useState("login");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // SafeHire-style 3-Step OTP Password Reset States
  const [forgotStep, setForgotStep] = useState("email"); // 'email' | 'otp' | 'newpw'
  const [otpEmail, setOtpEmail] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);
  const [otpBannerMsg, setOtpBannerMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Feedback, Loading & Rate Limiting States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const switchTimer = useRef(null);

  // Rate Limiting Countdown (Item 8)
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Resend OTP Countdown (Item 2)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Trigger the Sliding Blade Animation
  const switchMode = (targetMode) => {
    if (targetMode === mode) return;
    setError("");
    setSuccessMsg("");
    clearTimeout(switchTimer.current);

    if (targetMode === "signup" && mode === "login") {
      // Sweep blade from right to left
      setAnimClass("sweep-to-left");
      // Mid-travel update blade content under dark cover
      switchTimer.current = setTimeout(() => {
        setDisplayedBladeMode("signup");
        setMode("signup");
      }, 260);
    } else if (targetMode === "login" && mode === "signup") {
      // Sweep blade from left to right
      setAnimClass("sweep-to-right");
      // Mid-travel update blade content under dark cover
      switchTimer.current = setTimeout(() => {
        setDisplayedBladeMode("login");
        setMode("login");
      }, 260);
    } else if (targetMode === "forgot") {
      setMode("forgot");
      setForgotStep("email");
    } else if (targetMode === "login" && mode === "forgot") {
      setMode("login");
    }
  };

  // Password rules validation
  const pwRules = {
    length: (password || "").length >= 8,
    upper: /[A-Z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
    special: /[!@#$%^&*(),.?":{}|<>_~+=-]/.test(password || ""),
  };

  const newPwRules = {
    length: (newPassword || "").length >= 8,
    upper: /[A-Z]/.test(newPassword || ""),
    number: /[0-9]/.test(newPassword || ""),
    special: /[!@#$%^&*(),.?":{}|<>_~+=-]/.test(newPassword || ""),
  };

  // SafeHire OTP Flow: Step 1 - Send 6-digit OTP code to email
  const handleSendOtp = (targetEmail) => {
    const cleanEmail = (targetEmail || email || "").toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address to receive your OTP verification code.");
      return;
    }
    setError("");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpEmail(cleanEmail);
    setEnteredOtp("");
    setOtpBannerMsg(`📧 Verification email sent to ${cleanEmail}! SafeHire Security OTP: [ ${code} ]`);
    setForgotStep("otp");
    setResendTimer(30);
  };

  // SafeHire OTP Flow: Step 2 - Verify entered 6-digit code
  const handleVerifyOtp = (e) => {
    e?.preventDefault?.();
    setError("");
    const cleaned = (enteredOtp || "").trim();
    if (!cleaned) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    if (cleaned === generatedOtp) {
      setError("");
      setForgotStep("newpw");
    } else {
      setError("Invalid OTP code. Please enter the correct 6-digit verification code.");
    }
  };

  // SafeHire OTP Flow: Step 3 - Set and confirm new password
  const handleResetPassword = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match. Please verify and re-enter.");
      return;
    }
    if (!newPwRules.length || !newPwRules.upper || !newPwRules.number || !newPwRules.special) {
      setError("Password must contain at least 8 characters, 1 uppercase letter (A-Z), 1 number (0-9), and 1 special symbol (!@#$).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await analytics.resetPassword(otpEmail, newPassword);
      if (res.success) {
        setError("");
        setSuccessMsg("✓ Password reset successfully! Please sign in with your new password.");
        setMode("login");
        setEmail(otpEmail);
        setPassword("");
        setConfirmPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotStep("email");
        setOtpBannerMsg("");
      } else {
        setError(res.error || "Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Form Submission (Sign In or Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setError(`Security lockout: Please wait ${lockoutTimer}s before attempting again.`);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your full name.");
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError("Please enter a valid email address.");
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const res = await analytics.register(name, email, password, rememberMe);
        if (res.success) {
          setError("");
          setFailedAttempts(0);
          if (onLoginSuccess) onLoginSuccess(res.user);
        } else if (res.alreadyExists) {
          setError("An account already exists with this email. Please sign in.");
          switchMode("login");
        } else {
          setError(res.error || "Registration failed. Please try again.");
        }
      } else if (mode === "login") {
        const res = await analytics.login(email, password, rememberMe);
        if (res.success) {
          setError("");
          setFailedAttempts(0);
          setLockoutTimer(0);
          if (onLoginSuccess) onLoginSuccess(res.user);
        } else if (res.notFound) {
          setError("No account found with this email. Creating a new one...");
          switchMode("signup");
        } else {
          const nextFailed = failedAttempts + 1;
          setFailedAttempts(nextFailed);
          if (nextFailed >= 5) {
            setLockoutTimer(30);
            setFailedAttempts(0);
            setError("Security lockout: 5 consecutive failed attempts. Form locked for 30s.");
          } else {
            setError(`${res.error || "Invalid email or password."} (${5 - nextFailed} attempts remaining)`);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verso-auth-wrapper">
      <style>{`
        /* ==========================================================================
           VERSO-STYLE SLIDING BLADE AUTHENTICATION ANIMATION
           ========================================================================== */
        .verso-auth-wrapper {
          position: relative;
          width: 100%;
          max-width: 890px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .verso-card {
          position: relative;
          width: 100%;
          min-height: 560px;
          background: #f7f5ee;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12);
          display: flex;
        }

        /* Close Floating Button */
        .verso-close-btn {
          position: absolute;
          top: 18px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #1e293b;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .verso-close-btn:hover {
          background: #e11d48;
          color: #ffffff;
          border-color: #e11d48;
          transform: scale(1.08);
        }

        /* Action Reason Banner */
        .verso-reason-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 14px;
          width: fit-content;
        }

        /* ==========================================================================
           TWO DUAL PANES (SIGN IN ON LEFT, SIGN UP ON RIGHT)
           ========================================================================== */
        .verso-pane {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          padding: 46px 42px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          z-index: 2;
          overflow-y: auto;
        }
        .verso-pane::-webkit-scrollbar {
          width: 4px;
        }
        .verso-pane::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }

        .verso-pane--left {
          left: 0;
        }
        .verso-pane--right {
          right: 0;
        }

        /* Form Visibility Transitions Underneath */
        .verso-pane-content {
          width: 100%;
          max-width: 350px;
          margin: 0 auto;
          transition: opacity 0.35s ease 0.15s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }
        .verso-pane--left .verso-pane-content {
          opacity: ${mode === "login" || mode === "forgot" ? "1" : "0"};
          transform: ${mode === "login" || mode === "forgot" ? "translateX(0)" : "translateX(-24px)"};
          pointer-events: ${mode === "login" || mode === "forgot" ? "auto" : "none"};
        }
        .verso-pane--right .verso-pane-content {
          opacity: ${mode === "signup" ? "1" : "0"};
          transform: ${mode === "signup" ? "translateX(0)" : "translateX(24px)"};
          pointer-events: ${mode === "signup" ? "auto" : "none"};
        }

        /* Typography & Underline Accent */
        .verso-heading {
          font-size: 27px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .verso-accent-bar {
          width: 38px;
          height: 3px;
          background: #c59b4c;
          border-radius: 2px;
          margin: 8px 0 22px;
        }

        /* Underline Form Fields */
        .verso-field {
          position: relative;
          margin-bottom: 20px;
        }
        .verso-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .verso-input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #d5cebf;
          background: transparent;
          padding: 10px 32px 10px 0;
          font-size: 15px;
          font-family: inherit;
          color: #0f172a;
          border-radius: 0;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }
        .verso-input:focus {
          outline: none;
          border-bottom-color: #17382c;
        }
        .verso-input::placeholder {
          color: #8c8273;
          font-size: 14.5px;
        }
        .verso-input-icon {
          position: absolute;
          right: 2px;
          color: #8c8273;
          pointer-events: none;
        }
        .verso-toggle-pw-btn {
          position: absolute;
          right: 2px;
          background: transparent;
          border: none;
          color: #8c8273;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .verso-toggle-pw-btn:hover {
          color: #0f172a;
        }

        /* Options Row (Keep signed in & Forgot Password) */
        .verso-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 8px 0 20px;
          font-size: 13.5px;
          color: #475569;
        }
        .verso-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .verso-checkbox {
          accent-color: #17382c;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .verso-forgot-btn {
          background: transparent;
          border: none;
          color: #855d24;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s ease;
        }
        .verso-forgot-btn:hover {
          color: #17382c;
        }

        /* Password Strength Bar & Dots */
        .verso-pw-checklist {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }
        .verso-pw-bars {
          display: flex;
          gap: 3px;
        }
        .verso-pw-bar {
          width: 14px;
          height: 3px;
          border-radius: 2px;
          background: #d5cebf;
          transition: background 0.2s ease;
        }
        .verso-pw-bar.is-valid {
          background: #16a34a;
        }

        /* Pill Submit Button */
        .verso-submit-btn {
          width: 100%;
          background: #17382c;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 13px 24px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(23, 56, 44, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-sizing: border-box;
          margin-top: 4px;
        }
        .verso-submit-btn:hover:not(:disabled) {
          background: #0f261e;
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(23, 56, 44, 0.35);
        }
        .verso-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .verso-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Switch Mode Footer Links */
        .verso-switch-footer {
          margin-top: 18px;
          text-align: left;
          font-size: 13.5px;
          color: #64748b;
        }
        .verso-switch-trigger {
          background: transparent;
          border: none;
          color: #0f172a;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          padding: 0 2px;
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 3px;
          transition: color 0.15s ease;
        }
        .verso-switch-trigger:hover {
          color: #17382c;
        }

        /* Alerts & OTP Banner */
        .verso-alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 14px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
        }
        .verso-alert--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }
        .verso-alert--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .verso-otp-banner {
          background: #f0fdf4;
          border: 1.5px solid #22c55e;
          color: #15803d;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        .verso-otp-input input {
          letter-spacing: 6px !important;
          font-family: monospace !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          text-align: center;
        }

        /* ==========================================================================
           THE SLIDING BLADE (ANIMATED RECTANGLE WITH DIAGONAL SKEW & LIT SEAMS)
           ========================================================================== */
        .verso-band {
          position: absolute;
          top: 0;
          height: 100%;
          width: 54%;
          z-index: 10;
          background: linear-gradient(145deg, #123126 0%, #091e17 55%, #05130e 100%);
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.4);
          transform-origin: center center;
          /* Default state based on mode */
          left: ${mode === "signup" ? "-4%" : "48%"};
          transform: skewX(-10deg);
        }

        /* Sweeping Animation When Transitioning Modes */
        @keyframes sweepToLeft {
          0% {
            left: 48%;
            width: 54%;
          }
          45% {
            left: -2%;
            width: 104%;
          }
          100% {
            left: -4%;
            width: 54%;
          }
        }

        @keyframes sweepToRight {
          0% {
            left: -4%;
            width: 54%;
          }
          45% {
            left: -2%;
            width: 104%;
          }
          100% {
            left: 48%;
            width: 54%;
          }
        }

        .verso-band.sweep-to-left {
          animation: sweepToLeft 0.72s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }
        .verso-band.sweep-to-right {
          animation: sweepToRight 0.72s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        /* Lit Seams (One Blade, Two Lit Seams) */
        .verso-band-edge {
          position: absolute;
          top: -15%;
          bottom: -15%;
          width: 2px;
          pointer-events: none;
          z-index: 12;
        }
        .verso-band-edge--lead {
          left: 0;
          background: linear-gradient(180deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.9) 30%, rgba(255,255,255,0.95) 50%, rgba(212,175,55,0.9) 70%, rgba(212,175,55,0) 100%);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.8), 0 0 24px rgba(34, 197, 94, 0.4);
        }
        .verso-band-edge--trail {
          right: 0;
          background: linear-gradient(180deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.9) 30%, rgba(255,255,255,0.95) 50%, rgba(212,175,55,0.9) 70%, rgba(212,175,55,0) 100%);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.8), 0 0 24px rgba(34, 197, 94, 0.4);
        }

        /* Ambient Emerald Glow Inside Blade */
        .verso-band-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at ${displayedBladeMode === "login" ? "80% 25%" : "20% 25%"}, rgba(34, 197, 94, 0.14) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Counter-Skew Inner Container (Prevents Text Distortion) */
        .verso-band-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform: skewX(10deg); /* Exact inverse of outer -10deg skew */
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 56px;
          box-sizing: border-box;
          z-index: 11;
        }

        /* Blade Content & Typography */
        .verso-brand-tag {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #a4beae;
          margin-bottom: 22px;
        }
        .verso-welcome-title {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: 38px;
          line-height: 1.15;
          font-weight: 400;
          color: #fbfbf9;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .verso-welcome-title em {
          font-style: italic;
          font-weight: 400;
          color: #e8dcc4;
        }
        .verso-welcome-desc {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(240, 245, 242, 0.72);
          margin-top: 18px;
          margin-bottom: 0;
          max-width: 310px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 780px) {
          .verso-auth-wrapper {
            max-width: 480px;
          }
          .verso-card {
            flex-direction: column;
            min-height: auto;
          }
          .verso-band {
            display: none; /* Hide desktop sliding blade on mobile */
          }
          .verso-pane {
            position: relative !important;
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            padding: 36px 26px;
          }
          .verso-pane-content {
            opacity: 1 !important;
            transform: none !important;
            pointer-events: auto !important;
          }
        }
      `}</style>

      {onClose && (
        <button
          type="button"
          className="verso-close-btn"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          ✕
        </button>
      )}

      <div className="verso-card" data-mode={mode}>
        {/* ==================================================================
            LEFT PANE: SIGN IN & FORGOT PASSWORD FLOW
            ================================================================== */}
        <div className="verso-pane verso-pane--left">
          <div className="verso-pane-content">
            {reason && (
              <div className="verso-reason-pill" role="alert">
                <span aria-hidden="true">🔒</span>
                <span>{reason}</span>
              </div>
            )}

            {error && mode !== "signup" && (
              <div className="verso-alert verso-alert--error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && mode !== "signup" && (
              <div className="verso-alert verso-alert--success" role="status">
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{successMsg}</span>
              </div>
            )}

            {otpBannerMsg && (
              <div className="verso-otp-banner" role="status">
                {otpBannerMsg}
              </div>
            )}

            {/* --- SIGN IN FORM --- */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} noValidate autoComplete="off">
                <h2 className="verso-heading">Sign in</h2>
                <div className="verso-accent-bar" />

                <div className="verso-field">
                  <div className="verso-input-wrap">
                    <input
                      type="email"
                      id="signin-email"
                      className="verso-input"
                      placeholder="Username or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <User size={18} className="verso-input-icon" aria-hidden="true" />
                  </div>
                </div>

                <div className="verso-field">
                  <div className="verso-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signin-password"
                      className="verso-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="verso-toggle-pw-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="verso-options-row">
                  <label className="verso-checkbox-label">
                    <input
                      type="checkbox"
                      className="verso-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </label>

                  <button
                    type="button"
                    className="verso-forgot-btn"
                    onClick={() => switchMode("forgot")}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="verso-submit-btn"
                  disabled={isSubmitting || lockoutTimer > 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : lockoutTimer > 0 ? (
                    `Locked (${lockoutTimer}s)`
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="verso-switch-footer">
                  <span>New to REELIST? </span>
                  <button
                    type="button"
                    className="verso-switch-trigger"
                    onClick={() => switchMode("signup")}
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* --- FORGOT PASSWORD 3-STEP FLOW --- */}
            {mode === "forgot" && (
              <div>
                <h2 className="verso-heading">
                  {forgotStep === "email" && "Reset Password"}
                  {forgotStep === "otp" && "Enter OTP"}
                  {forgotStep === "newpw" && "Set Password"}
                </h2>
                <div className="verso-accent-bar" />

                {forgotStep === "email" && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                    <div className="verso-field">
                      <div className="verso-input-wrap">
                        <input
                          type="email"
                          className="verso-input"
                          placeholder="Registered email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                        />
                        <Mail size={18} className="verso-input-icon" />
                      </div>
                    </div>
                    <button type="submit" className="verso-submit-btn">
                      Send 6-Digit Code
                    </button>
                  </form>
                )}

                {forgotStep === "otp" && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="verso-field verso-otp-input">
                      <div className="verso-input-wrap">
                        <input
                          type="text"
                          className="verso-input"
                          placeholder="••••••"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <button type="submit" className="verso-submit-btn">
                      Verify Code
                    </button>
                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                      <button
                        type="button"
                        className="verso-forgot-btn"
                        disabled={resendTimer > 0}
                        onClick={() => handleSendOtp(otpEmail)}
                      >
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP code"}
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === "newpw" && (
                  <form onSubmit={handleResetPassword}>
                    <div className="verso-field">
                      <div className="verso-input-wrap">
                        <input
                          type={showNewPw ? "text" : "password"}
                          className="verso-input"
                          placeholder="New password (min 8 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="verso-toggle-pw-btn"
                          onClick={() => setShowNewPw(!showNewPw)}
                        >
                          {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="verso-field">
                      <div className="verso-input-wrap">
                        <input
                          type={showConfirmNewPw ? "text" : "password"}
                          className="verso-input"
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="verso-toggle-pw-btn"
                          onClick={() => setShowConfirmNewPw(!showConfirmNewPw)}
                        >
                          {showConfirmNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="verso-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Save New Password"}
                    </button>
                  </form>
                )}

                <div style={{ marginTop: "16px" }}>
                  <button
                    type="button"
                    className="verso-forgot-btn"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    onClick={() => switchMode("login")}
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT PANE: CREATE ACCOUNT (SIGN UP) FORM
            ================================================================== */}
        <div className="verso-pane verso-pane--right">
          <div className="verso-pane-content">
            {error && mode === "signup" && (
              <div className="verso-alert verso-alert--error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <h2 className="verso-heading">Create account</h2>
              <div className="verso-accent-bar" />

              <div className="verso-field">
                <div className="verso-input-wrap">
                  <input
                    type="text"
                    id="signup-name"
                    className="verso-input"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <User size={18} className="verso-input-icon" aria-hidden="true" />
                </div>
              </div>

              <div className="verso-field">
                <div className="verso-input-wrap">
                  <input
                    type="email"
                    id="signup-email"
                    className="verso-input"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={18} className="verso-input-icon" aria-hidden="true" />
                </div>
              </div>

              <div className="verso-field">
                <div className="verso-input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="signup-password"
                    className="verso-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="verso-toggle-pw-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="verso-pw-checklist">
                  <div className="verso-pw-bars">
                    <span className={`verso-pw-bar ${pwRules.length ? "is-valid" : ""}`} />
                    <span className={`verso-pw-bar ${pwRules.upper ? "is-valid" : ""}`} />
                    <span className={`verso-pw-bar ${pwRules.number ? "is-valid" : ""}`} />
                    <span className={`verso-pw-bar ${pwRules.special ? "is-valid" : ""}`} />
                  </div>
                  <span>Use 8 characters or more.</span>
                </div>
              </div>

              <button
                type="submit"
                className="verso-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="verso-switch-footer">
                <span>Already have an account? </span>
                <button
                  type="button"
                  className="verso-switch-trigger"
                  onClick={() => switchMode("login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ==================================================================
            THE SLIDING BLADE (ANIMATED RECTANGLE WITH DIAGONAL SKEW & LIT SEAMS)
            ================================================================== */}
        <div className={`verso-band ${animClass}`}>
          <span className="verso-band-edge verso-band-edge--lead" aria-hidden="true" />
          <span className="verso-band-edge verso-band-edge--trail" aria-hidden="true" />
          <div className="verso-band-glow" aria-hidden="true" />

          <div className="verso-band-inner">
            <span className="verso-brand-tag">REELIST</span>
            
            {displayedBladeMode === "login" ? (
              <>
                <h3 className="verso-welcome-title">
                  Welcome<br />
                  <em>back.</em>
                </h3>
                <p className="verso-welcome-desc">
                  Your watchlist, your ratings and your people are exactly where you left them.
                </p>
              </>
            ) : (
              <>
                <h3 className="verso-welcome-title">
                  Start the<br />
                  <em>first page.</em>
                </h3>
                <p className="verso-welcome-desc">
                  One account for every premiere, every trailer and every device you own.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
