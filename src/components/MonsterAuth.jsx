import React, { useState, useRef, useEffect, useCallback } from "react";
import { User, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { analytics } from "../api/analytics.js";

// Eye tracking offset calculation hook
function useEyeOffset(ref, mouse, maxOffset, lookAway) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const measure = () => ref.current && setRect(ref.current.getBoundingClientRect());
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref]);

  if (lookAway) return { x: -maxOffset * 0.5, y: -maxOffset * 0.9 };
  if (!mouse || !rect) return { x: 0, y: 0 };

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = mouse.x - cx;
  const dy = mouse.y - cy;
  const dist = Math.min(Math.hypot(dx, dy), 120) / 120;
  const angle = Math.atan2(dy, dx);
  return { x: Math.cos(angle) * maxOffset * dist, y: Math.sin(angle) * maxOffset * dist };
}

// Single eye component with moving pupil
function Eye_({ size = 20, pupil = 8, offset }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: pupil,
          height: pupil,
          borderRadius: "50%",
          background: "#1f2937",
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform .05s linear",
        }}
      />
    </div>
  );
}

// Animated Coffee Cup Snack
function CoffeeCup({ mouse, lookAway, mouthOpen }) {
  const ref = useRef(null);
  const offset = useEyeOffset(ref, mouse, 5, lookAway);
  return (
    <div ref={ref} className="mon mon-cup">
      <div className="cup-steam">
        <span /><span /><span />
      </div>
      <div className="cup-handle" />
      <div className="cup-sleeve" />
      <div className="cup-body">
        <div className="eyes-row">
          <Eye_ offset={offset} size={20} pupil={8} />
          <Eye_ offset={offset} size={20} pupil={8} />
        </div>
        <div className={`cup-mouth ${mouthOpen ? "open" : ""}`}>
          <div className="teeth" />
        </div>
      </div>
      <div className="snack-legs">
        <div className="leg cup" />
        <div className="leg cup" />
      </div>
    </div>
  );
}

// Animated Donut Snack
function Donut({ mouse, lookAway, mouthOpen }) {
  const ref = useRef(null);
  const offset = useEyeOffset(ref, mouse, 4, lookAway);
  return (
    <div ref={ref} className="mon mon-donut">
      <div className="donut-ring">
        <span className="sprinkle s1" />
        <span className="sprinkle s2" />
        <span className="sprinkle s3" />
        <span className="sprinkle s4" />
        <span className="sprinkle s5" />
        <div className="donut-hole" />
        <div className="eyes-row donut-eyes">
          <Eye_ offset={offset} size={18} pupil={7} />
          <Eye_ offset={offset} size={18} pupil={7} />
        </div>
        <div className={`donut-mouth ${mouthOpen ? "open" : ""}`} />
      </div>
      <div className="snack-legs">
        <div className="leg donut" />
        <div className="leg donut" />
      </div>
    </div>
  );
}

// Animated Popcorn Bucket Snack
function Popcorn({ mouse, lookAway, mouthOpen }) {
  const ref = useRef(null);
  const offset = useEyeOffset(ref, mouse, 6, lookAway);
  return (
    <div ref={ref} className="mon mon-popcorn">
      <div className="popcorn-top">
        <div className="kernel-row row-top"><span /></div>
        <div className="kernel-row row-mid"><span /><span /><span /></div>
        <div className="kernel-row row-bottom"><span /><span /><span /><span /></div>
      </div>
      <div className="popcorn-bucket">
        <div className="eyes-row">
          <Eye_ offset={offset} size={20} pupil={8} />
          <Eye_ offset={offset} size={20} pupil={8} />
        </div>
        <div className={`popcorn-mouth ${mouthOpen ? "open" : ""}`}>
          <div className="teeth" />
        </div>
      </div>
    </div>
  );
}

// Animated Soda Can Snack
function Soda({ mouse, lookAway, mouthOpen }) {
  const ref = useRef(null);
  const offset = useEyeOffset(ref, mouse, 6, lookAway);
  return (
    <div ref={ref} className="mon mon-soda">
      <div className="soda-tab" />
      <div className="soda-can">
        <div className="soda-label" />
        <div className="eyes-row">
          <Eye_ offset={offset} size={18} pupil={7} />
          <Eye_ offset={offset} size={18} pupil={7} />
        </div>
        <div className={`soda-mouth ${mouthOpen ? "open" : ""}`} />
      </div>
      <div className="snack-legs">
        <div className="leg soda" />
        <div className="leg soda" />
      </div>
    </div>
  );
}

// The Concession Squad Stage Component
function ConcessionSquad({ mouse, passwordFocused, emailTyping }) {
  return (
    <div className="concession-squad-stage">
      <div className="monsters">
        <div className="mon-slot slot-popcorn">
          <Popcorn mouse={mouse} lookAway={passwordFocused} mouthOpen={emailTyping} />
        </div>
        <div className="mon-slot slot-donut">
          <Donut mouse={mouse} lookAway={passwordFocused} mouthOpen={emailTyping} />
        </div>
        <div className="mon-slot slot-cup">
          <CoffeeCup mouse={mouse} lookAway={passwordFocused} mouthOpen={emailTyping} />
        </div>
        <div className="mon-slot slot-soda">
          <Soda mouse={mouse} lookAway={passwordFocused} mouthOpen={emailTyping} />
        </div>
      </div>
      <div className="stage-ground" />
    </div>
  );
}

export default function MonsterAuth({ onClose, onLoginSuccess, _isModal = false, reason = "" }) {
  // mode: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState("login");
  const [animClass, setAnimClass] = useState(""); // 'anim-sweep-left' | 'anim-sweep-right' | ''
  const [displayedContentMode, setDisplayedContentMode] = useState("login");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Interactive Eye-Tracking & Reaction States
  const [mouse, setMouse] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailTyping, setEmailTyping] = useState(false);
  const rafRef = useRef(null);
  const typingTimeout = useRef(null);
  const animTimerRef = useRef(null);
  const midPointTimerRef = useRef(null);

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

  // Mouse move listener for reactive pupil tracking
  const onMouseMove = useCallback((e) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setMouse({ x: e.clientX, y: e.clientY });
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

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

  // Slow, Silky Smooth Blade Slide Trigger (1.1s duration, midpoint cover exchange)
  const triggerSlide = (targetMode) => {
    if (targetMode === mode) return;
    setError("");
    setSuccessMsg("");
    clearTimeout(animTimerRef.current);
    clearTimeout(midPointTimerRef.current);

    if (targetMode === "signup" && mode === "login") {
      setAnimClass("anim-sweep-left");
      // Mid-point: at 480ms when the blade completely covers the card, trade states
      midPointTimerRef.current = setTimeout(() => {
        setMode("signup");
        setDisplayedContentMode("signup");
      }, 480);
      // Settle at 1100ms
      animTimerRef.current = setTimeout(() => {
        setAnimClass("");
      }, 1100);
    } else if (targetMode === "login" && mode === "signup") {
      setAnimClass("anim-sweep-right");
      // Mid-point: at 480ms when the blade completely covers the card, trade states
      midPointTimerRef.current = setTimeout(() => {
        setMode("login");
        setDisplayedContentMode("login");
      }, 480);
      // Settle at 1100ms
      animTimerRef.current = setTimeout(() => {
        setAnimClass("");
      }, 1100);
    } else if (targetMode === "forgot") {
      setMode("forgot");
      setForgotStep("email");
    } else if (targetMode === "login" && mode === "forgot") {
      setMode("login");
    }
  };

  // Handle typing reaction for snack mouths
  const handleEmailInput = (val) => {
    setEmail(val);
    if (error) setError("");
    setEmailTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setEmailTyping(false), 550);
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
          triggerSlide("login");
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
          setError("No account found with this email. Switching to registration...");
          triggerSlide("signup");
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
           SLOW & SMOOTH SLIDING BLADE AUTHENTICATION ANIMATION (1.1s DURATION)
           ========================================================================== */
        .verso-auth-wrapper {
          --coffee: #c98a4b;
          --coffee-dark: #3d2b1a;
          --donut-glaze: #ff8fab;
          --donut-base: #e8a24a;
          --popcorn-cream: #fff2d6;
          --popcorn-red: #e63946;
          --soda-can: #e6314a;
          --radius-full: 999px;
          --radius-lg: 16px;
          --radius-md: 10px;
          --radius-sm: 6px;

          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .verso-card {
          position: relative;
          width: 100%;
          min-height: 590px;
          background: #f7f5ee;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          display: flex;
        }

        /* Floating Close Button */
        .verso-close-btn {
          position: absolute;
          top: 18px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
           DUAL FORM PANES (SIGN IN ON LEFT, SIGN UP ON RIGHT)
           ========================================================================== */
        .verso-form-pane {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          padding: 44px 40px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: opacity 0.5s ease 0.35s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
          z-index: 2;
          overflow-y: auto;
        }
        .verso-form-pane::-webkit-scrollbar {
          width: 4px;
        }
        .verso-form-pane::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }

        .verso-form-pane--signin {
          left: 0;
        }
        .verso-form-pane--signup {
          right: 0;
        }

        /* Pane Visibility States */
        .verso-card.is-login .verso-form-pane--signin,
        .verso-card.is-forgot .verso-form-pane--signin {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }
        .verso-card.is-signup .verso-form-pane--signin {
          opacity: 0;
          pointer-events: none;
          transform: translateX(-35px);
        }

        .verso-card.is-signup .verso-form-pane--signup {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }
        .verso-card.is-login .verso-form-pane--signup,
        .verso-card.is-forgot .verso-form-pane--signup {
          opacity: 0;
          pointer-events: none;
          transform: translateX(35px);
        }

        .verso-pane-content {
          width: 100%;
          max-width: 350px;
          margin: 0 auto;
        }

        /* Typography & Gold Accent Bar */
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
           THE SLIDING BLADE: SLOW, EXPANDING & BUTTERY SMOOTH (1.1s DURATION)
           ========================================================================== */
        .verso-sliding-blade {
          position: absolute;
          top: 0;
          height: 100%;
          z-index: 10;
          background: linear-gradient(150deg, #102e23 0%, #081a13 55%, #040e0a 100%);
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.45);
          transform-origin: center center;
          /* Default state when at rest */
          left: ${mode === "signup" ? "-3%" : "48%"};
          width: 55%;
          transform: skewX(-8deg);
        }

        /* Keyframes for the expanding sweep across the card (exact to the video!) */
        @keyframes bladeSweepToLeftSlow {
          0% {
            left: 48%;
            width: 55%;
          }
          40% {
            left: -3%;
            width: 106%;
          }
          55% {
            left: -3%;
            width: 106%;
          }
          100% {
            left: -3%;
            width: 55%;
          }
        }

        @keyframes bladeSweepToRightSlow {
          0% {
            left: -3%;
            width: 55%;
          }
          40% {
            left: -3%;
            width: 106%;
          }
          55% {
            left: -3%;
            width: 106%;
          }
          100% {
            left: 48%;
            width: 55%;
          }
        }

        .verso-sliding-blade.anim-sweep-left {
          animation: bladeSweepToLeftSlow 1.1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        .verso-sliding-blade.anim-sweep-right {
          animation: bladeSweepToRightSlow 1.1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        /* Lit Seams (One Blade, Two Lit Seams) */
        .verso-band-edge {
          position: absolute;
          top: -15%;
          bottom: -15%;
          width: 2.5px;
          pointer-events: none;
          z-index: 12;
        }
        .verso-band-edge--lead {
          left: 0;
          background: linear-gradient(180deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.95) 30%, rgba(255,255,255,0.95) 50%, rgba(212,175,55,0.95) 70%, rgba(212,175,55,0) 100%);
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.85), 0 0 25px rgba(34, 197, 94, 0.45);
        }
        .verso-band-edge--trail {
          right: 0;
          background: linear-gradient(180deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.95) 30%, rgba(255,255,255,0.95) 50%, rgba(212,175,55,0.95) 70%, rgba(212,175,55,0) 100%);
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.85), 0 0 25px rgba(34, 197, 94, 0.45);
        }

        .verso-band-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 30%, rgba(34, 197, 94, 0.16) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Counter-Skew Inner Container (Cancels Out -8deg Skew For Text & Snacks) */
        .verso-blade-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform: skewX(8deg); /* Cancels out the outer -8deg skew */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 34px 38px 28px;
          box-sizing: border-box;
          z-index: 11;
          text-align: center;
        }

        /* Blade Top Typography with Gentle Cross-Fade */
        .verso-blade-top {
          width: 100%;
        }
        .verso-brand-tag {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #a4beae;
          margin-bottom: 8px;
        }
        .verso-welcome-title {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 400;
          color: #fbfbf9;
          margin: 0;
          letter-spacing: -0.01em;
          transition: opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s;
        }
        .verso-welcome-title em {
          font-style: italic;
          font-weight: 400;
          color: #e8dcc4;
        }

        /* Blade Bottom Subtitle */
        .verso-welcome-desc {
          font-size: 13px;
          line-height: 1.55;
          color: rgba(240, 245, 242, 0.75);
          margin: 0;
          max-width: 330px;
          transition: opacity 0.4s ease 0.25s;
        }

        /* ==========================================================================
           CONCESSION SQUAD (POPCORN, COFFEE, DONUT, SODA) CSS STYLES
           ========================================================================== */
        .concession-squad-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin: 12px 0 8px;
        }
        .monsters {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 12px;
          transform: scale(0.92);
          transform-origin: center bottom;
          margin-bottom: 4px;
        }
        .stage-ground {
          width: 290px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 70%);
          margin-top: -6px;
        }
        .mon-slot { display: flex; flex-direction: column; align-items: center; }
        .slot-popcorn { margin-bottom: 22px; }
        .slot-donut { margin-bottom: 0px; }
        .slot-cup { margin-bottom: 34px; margin-right: 10px; }
        .slot-soda { margin-bottom: 10px; margin-left: 2px; }
        .mon { position: relative; display: flex; flex-direction: column; align-items: center; }
        .eyes-row { display: flex; gap: 6px; z-index: 3; position: relative; }
        .snack-legs { display: flex; gap: 18px; margin-top: -4px; }
        .leg { width: 7px; height: 30px; border-radius: var(--radius-sm); }
        .leg.cup { background: var(--coffee-dark); opacity: 0.6; }
        .leg.donut { background: #b5762f; opacity: 0.6; }
        .leg.soda { background: #7a1620; opacity: 0.7; }

        /* Coffee Cup Monster */
        .mon-cup { width: 90px; position: relative; }
        .cup-steam { position: relative; height: 18px; display: flex; justify-content: center; gap: 7px; margin-bottom: 2px; }
        .cup-steam span { width: 3px; height: 14px; border-radius: var(--radius-sm); background: #c9a876; opacity: 0.75; transform: rotate(8deg); }
        .cup-steam span:nth-child(2) { transform: rotate(-6deg); height: 18px; }
        .cup-handle {
          position: absolute; right: -10px; top: 36px;
          width: 20px; height: 20px; border-radius: 50%;
          border: 4.5px solid var(--coffee-dark); border-left-color: transparent; border-bottom-color: transparent;
          transform: rotate(45deg);
        }
        .cup-sleeve { width: 100%; height: 15px; background: var(--coffee); border-radius: var(--radius-sm) var(--radius-sm) 0 0; border: 2.5px solid var(--coffee-dark); border-bottom: none; }
        .cup-body {
          width: 100%; height: 84px;
          background: #ffffff;
          border: 2.5px solid var(--coffee-dark);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 5px 0 rgba(0,0,0,0.12);
        }
        .cup-mouth { width: 20px; height: 5px; background: var(--coffee-dark); border-radius: var(--radius-sm); overflow: hidden; transition: height .15s ease; display: flex; }
        .cup-mouth.open { height: 13px; border-radius: var(--radius-sm); background: #fff; }
        .cup-mouth .teeth { width: 100%; background: repeating-linear-gradient(90deg, #fff 0 4px, #cfd8e3 4px 6px); }

        /* Donut Monster */
        @keyframes donutWiggle {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(4deg); }
          70% { transform: rotate(-4deg); }
        }
        .mon-donut { width: 88px; animation: donutWiggle 3.2s ease-in-out infinite; transform-origin: bottom center; }
        .donut-ring {
          width: 88px; height: 88px;
          background: radial-gradient(circle at 35% 35%, var(--donut-glaze) 0%, #e06085 100%);
          border-radius: 50%;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 -5px 0 rgba(0,0,0,0.2), 0 5px 0 rgba(0,0,0,0.12);
          border: 2.5px solid #8c3b52;
        }
        .donut-hole { width: 22px; height: 22px; border-radius: 50%; background: #0c2018; border: 2px solid #8c3b52; position: absolute; }
        .donut-eyes { position: absolute; top: 16px; }
        .donut-mouth { position: absolute; bottom: 15px; width: 13px; height: 5px; background: #5c1b2c; border-radius: var(--radius-sm); transition: height .15s ease, border-radius .15s ease; }
        .donut-mouth.open { height: 11px; border-radius: var(--radius-sm); }
        .sprinkle { position: absolute; width: 7px; height: 3px; border-radius: var(--radius-sm); }
        .s1 { background: #ffeb3b; top: 11px; left: 22px; transform: rotate(20deg); }
        .s2 { background: #4caf50; top: 17px; right: 18px; transform: rotate(-30deg); }
        .s3 { background: #00bcd4; bottom: 24px; left: 13px; transform: rotate(45deg); }
        .s4 { background: #ff9800; bottom: 17px; right: 18px; transform: rotate(-15deg); }
        .s5 { background: #fff; top: 38px; left: 11px; transform: rotate(60deg); }

        /* Popcorn Monster */
        @keyframes popcornWiggle {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-2.5deg); }
          60% { transform: rotate(2.5deg); }
        }
        .mon-popcorn { width: 98px; animation: popcornWiggle 2.8s ease-in-out infinite; transform-origin: bottom center; }
        .popcorn-top { position: relative; height: 52px; width: 100%; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
        .kernel-row { display: flex; justify-content: center; }
        .kernel-row span {
          width: 23px; height: 23px; border-radius: 50%; flex-shrink: 0;
          background: #fff2d6; border: 2px solid #3d2b1a;
          margin-left: -6px;
          box-shadow: inset -2px -2px 0 rgba(230, 180, 80, 0.45);
        }
        .kernel-row span:first-child { margin-left: 0; }
        .kernel-row.row-top { margin-bottom: -8px; z-index: 3; }
        .kernel-row.row-mid { margin-bottom: -8px; z-index: 2; }
        .kernel-row.row-bottom { z-index: 1; }
        .popcorn-bucket {
          width: 98px; height: 98px;
          background: repeating-linear-gradient(90deg, #fff6ec 0 12px, var(--popcorn-red) 12px 22px);
          border: 2.5px solid #3d2b1a;
          clip-path: polygon(4% 0%, 96% 0%, 75% 100%, 25% 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
          padding-top: 5px;
          box-shadow: 0 5px 0 rgba(0,0,0,0.15);
        }
        .popcorn-mouth { width: 20px; height: 7px; background: #3d2b1a; border-radius: var(--radius-sm); overflow: hidden; transition: height .15s ease; display: flex; }
        .popcorn-mouth.open { height: 14px; border-radius: var(--radius-sm); background: #fff; }
        .popcorn-mouth .teeth { width: 100%; background: repeating-linear-gradient(90deg, #fff 0 4px, #cfd8e3 4px 6px); }

        /* Soda Can Monster */
        @keyframes sodaFizz {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(-3deg); }
          55% { transform: translateY(1px) rotate(0deg); }
          80% { transform: translateY(-3px) rotate(3deg); }
        }
        .mon-soda { width: 70px; animation: sodaFizz 2.6s ease-in-out infinite; transform-origin: bottom center; }
        .soda-tab { width: 16px; height: 8px; border-radius: var(--radius-sm); background: linear-gradient(180deg, #e8e8e8, #a8a8a8); border: 2px solid #3d2b1a; margin: 0 auto -2px; position: relative; z-index: 3; }
        .soda-can {
          width: 70px; height: 116px;
          background: linear-gradient(180deg, #e6314a 0%, #c8102e 100%);
          border: 2.5px solid #3d2b1a;
          border-radius: var(--radius-md);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 0 rgba(0,0,0,0.15);
        }
        .soda-can::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 14px;
          background: linear-gradient(180deg, #f0f0f0, #b0b0b0);
          border-bottom: 2px solid #3d2b1a;
          z-index: 1;
        }
        .soda-can::after {
          content: "";
          position: absolute; bottom: 0; left: 0; right: 0; height: 9px;
          background: linear-gradient(180deg, #b0b0b0, #8a8a8a);
          border-top: 2px solid #3d2b1a;
          z-index: 1;
        }
        .soda-mouth { width: 13px; height: 5px; background: #4a000a; border-radius: var(--radius-sm); transition: height .15s ease; }
        .soda-mouth.open { height: 10px; border-radius: var(--radius-sm); }

        /* Mobile Responsiveness */
        @media (max-width: 820px) {
          .verso-auth-wrapper {
            max-width: 480px;
          }
          .verso-card {
            flex-direction: column;
            min-height: auto;
          }
          .verso-sliding-blade {
            display: none; /* Hide desktop sliding blade on mobile */
          }
          .verso-form-pane {
            position: relative !important;
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            padding: 36px 26px;
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

      <div className={`verso-card is-${mode}`}>
        {/* ==================================================================
            LEFT FORM PANE: SIGN IN & FORGOT PASSWORD FLOW
            ================================================================== */}
        <div className="verso-form-pane verso-form-pane--signin">
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
                      onChange={(e) => handleEmailInput(e.target.value)}
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
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
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
                    onClick={() => {
                      setError("");
                      setSuccessMsg("");
                      setMode("forgot");
                      setForgotStep("email");
                    }}
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
                    onClick={() => triggerSlide("signup")}
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
                          onChange={(e) => handleEmailInput(e.target.value)}
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
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
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
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
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
                    onClick={() => {
                      setError("");
                      setSuccessMsg("");
                      setMode("login");
                    }}
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT FORM PANE: CREATE ACCOUNT (SIGN UP) FORM
            ================================================================== */}
        <div className="verso-form-pane verso-form-pane--signup">
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
                    onChange={(e) => handleEmailInput(e.target.value)}
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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
                  onClick={() => triggerSlide("login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ==================================================================
            THE SLIDING BLADE WITH POPCORN, COCA, DONUT & COFFEE MONSTERS
            ================================================================== */}
        <div className={`verso-sliding-blade ${animClass}`}>
          <span className="verso-band-edge verso-band-edge--lead" aria-hidden="true" />
          <span className="verso-band-edge verso-band-edge--trail" aria-hidden="true" />
          <div className="verso-band-glow" aria-hidden="true" />

          <div className="verso-blade-inner">
            <div className="verso-blade-top">
              <span className="verso-brand-tag">REELIST • CINEMA</span>
              
              {displayedContentMode === "login" ? (
                <h3 className="verso-welcome-title">
                  Welcome<br />
                  <em>back.</em>
                </h3>
              ) : (
                <h3 className="verso-welcome-title">
                  Start the<br />
                  <em>first page.</em>
                </h3>
              )}
            </div>

            {/* THE CONCESSION SQUAD (POPCORN, COKE, DONUT, COFFEE) */}
            <ConcessionSquad
              mouse={mouse}
              passwordFocused={passwordFocused}
              emailTyping={emailTyping}
            />

            <div className="verso-blade-bottom">
              {displayedContentMode === "login" ? (
                <p className="verso-welcome-desc">
                  We kept your popcorn warm and your cinema watchlist ready!
                </p>
              ) : (
                <p className="verso-welcome-desc">
                  Grab your soda and popcorn &mdash; 2026 premiere seats are waiting for you!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
