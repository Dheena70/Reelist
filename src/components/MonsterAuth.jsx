import React, { useState, useRef, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { analytics } from "../api/analytics.js";

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

function Eye_({ size = 22, pupil = 9, offset }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: pupil,
          height: pupil,
          borderRadius: "50%",
          background: "#232323",
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform .05s linear",
        }}
      />
    </div>
  );
}

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
          <Eye_ offset={offset} size={22} pupil={9} />
          <Eye_ offset={offset} size={22} pupil={9} />
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
          <Eye_ offset={offset} size={20} pupil={8} />
          <Eye_ offset={offset} size={20} pupil={8} />
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
          <Eye_ offset={offset} size={22} pupil={9} />
          <Eye_ offset={offset} size={22} pupil={9} />
        </div>
        <div className={`popcorn-mouth ${mouthOpen ? "open" : ""}`}>
          <div className="teeth" />
        </div>
      </div>
    </div>
  );
}

function Soda({ mouse, lookAway, mouthOpen }) {
  const ref = useRef(null);
  const offset = useEyeOffset(ref, mouse, 7, lookAway);
  return (
    <div ref={ref} className="mon mon-soda">
      <div className="soda-tab" />
      <div className="soda-can">
        <div className="soda-label" />
        <div className="eyes-row">
          <Eye_ offset={offset} size={19} pupil={8} />
          <Eye_ offset={offset} size={19} pupil={8} />
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

function Monsters({ mouse, passwordFocused, emailTyping }) {
  return (
    <div className="monsters-wrapper">
      <div className="stage-banner">
        <span className="stage-badge">🍿 Concession Squad 🥤</span>
        <p className="stage-tagline">We keep watch while you pick your movie!</p>
      </div>
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

export default function MonsterAuth({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mouse, setMouse] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailTyping, setEmailTyping] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [fieldsVisible, setFieldsVisible] = useState(true);
  const rafRef = useRef(null);
  const typingTimeout = useRef(null);
  const switchTimeout = useRef(null);

  const switchMode = (next) => {
    if (next === mode) return;
    setFieldsVisible(false);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    clearTimeout(switchTimeout.current);
    switchTimeout.current = setTimeout(() => {
      setMode(next);
      setTimeout(() => setFieldsVisible(true), 300);
    }, 200);
  };

  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
  }, []);

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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    setEmailTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setEmailTyping(false), 600);
  };

  const pwRules = {
    length: (password || "").length >= 8,
    upper: /[A-Z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
    special: /[!@#$%^&*(),.?":{}|<>_~+=-]/.test(password || ""),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "signup") {
      if (!pwRules.length || !pwRules.upper || !pwRules.number || !pwRules.special) {
        setError("Password must contain at least 8 characters, 1 uppercase letter (A-Z), 1 number (0-9), and 1 special symbol (!@#$).");
        return;
      }
      const res = await analytics.register(name, email, password);
      if (res.success) {
        setError("");
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else if (res.alreadyExists) {
        setError("Account already exists with this email. Please sign in.");
        switchMode("login");
      } else {
        setError(res.error || "Registration failed.");
      }
    } else {
      const res = await analytics.login(email, password);
      if (res.success) {
        setError("");
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else if (res.notFound) {
        // Account does not exist: redirect directly to Sign Up (Create account) view
        setError("");
        switchMode("signup");
      } else {
        setError(res.error || "Authentication failed.");
      }
    }
  };

  return (
    <div className="auth-app">
      <style>{`
        .auth-app {
          --coffee: #c98a4b;
          --coffee-dark: #3d2b1a;
          --donut-glaze: #ff8fab;
          --donut-base: #e8a24a;
          --popcorn-cream: #fff2d6;
          --popcorn-red: #e63946;
          --soda-can: #4ecdc4;
          --radius-full: 999px;
          --radius-lg: 20px;
          --radius-md: 10px;
          --radius-sm: 4px;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          max-width: 960px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .auth-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          border-radius: var(--radius-full);
          width: 36px;
          height: 36px;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background 0.15s ease;
        }
        .auth-close-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        .auth-card {
          position: relative;
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          min-height: 590px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
          display: flex;
        }
        .left-panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px 28px;
          box-sizing: border-box;
          background: radial-gradient(circle at 50% 50%, #f9f8f4 0%, #ebe6dc 100%);
          transition: left .6s cubic-bezier(.65,0,.35,1);
        }
        .left-panel.at-left { left: 0; }
        .left-panel.at-right { left: 50%; }
        .right-panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: #ffffff;
          padding: 44px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          overflow: visible;
          transition: left .6s cubic-bezier(.65,0,.35,1);
        }
        .right-panel.at-left { left: 0; }
        .right-panel.at-right { left: 50%; }
        .form-fade { transition: opacity .25s ease; }
        .monsters-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
        }
        .stage-banner {
          text-align: center;
          padding-top: 8px;
        }
        .stage-badge {
          display: inline-block;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #7a4a35;
          background: rgba(122, 74, 53, 0.1);
          padding: 5px 16px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(122, 74, 53, 0.2);
        }
        .stage-tagline {
          margin: 8px 0 0;
          font-size: 14px;
          font-weight: 600;
          color: #8c7d70;
        }
        .monsters {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 16px;
          transform: scale(1.08);
          transform-origin: center bottom;
          margin-bottom: 6px;
        }
        .stage-ground {
          width: 320px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(61, 43, 26, 0.22) 0%, rgba(61, 43, 26, 0) 70%);
          margin-top: -6px;
        }
        .mon-slot { display: flex; flex-direction: column; align-items: center; }
        .slot-popcorn { margin-bottom: 24px; }
        .slot-donut { margin-bottom: 0px; }
        .slot-cup { margin-bottom: 38px; margin-right: 14px; }
        .slot-soda { margin-bottom: 12px; margin-left: 4px; }
        .mon { position: relative; display: flex; flex-direction: column; align-items: center; }
        .eyes-row { display: flex; gap: 6px; z-index: 3; position: relative; }
        .snack-legs { display: flex; gap: 20px; margin-top: -4px; }
        .leg { width: 8px; height: 34px; border-radius: 4px; }
        .leg.cup { background: var(--coffee-dark); opacity: 0.5; }
        .leg.donut { background: #b5762f; opacity: 0.5; }
        .leg.soda { background: #7a1620; opacity: 0.6; }

        .mon-cup { width: 98px; position: relative; }
        .cup-steam { position: relative; height: 20px; display: flex; justify-content: center; gap: 8px; margin-bottom: 2px; }
        .cup-steam span { width: 3px; height: 16px; border-radius: 3px; background: #c9a876; opacity: 0.6; transform: rotate(8deg); }
        .cup-steam span:nth-child(2) { transform: rotate(-6deg); height: 20px; }
        .cup-handle {
          position: absolute; right: -12px; top: 40px;
          width: 22px; height: 22px; border-radius: 50%;
          border: 5px solid var(--coffee-dark); border-left-color: transparent; border-bottom-color: transparent;
          transform: rotate(45deg);
        }
        .cup-sleeve { width: 100%; height: 16px; background: var(--coffee); border-radius: 8px 8px 0 0; border: 2.5px solid var(--coffee-dark); border-bottom: none; }
        .cup-body {
          width: 100%; height: 92px;
          background: #fff;
          border: 2.5px solid var(--coffee-dark);
          border-radius: 0 0 16px 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 0 rgba(0,0,0,0.08);
        }
        .cup-mouth { width: 22px; height: 6px; background: var(--coffee-dark); border-radius: 4px; overflow: hidden; transition: height .15s ease; display: flex; }
        .cup-mouth.open { height: 14px; border-radius: 8px; background: #fff; }
        .cup-mouth .teeth { width: 100%; background: repeating-linear-gradient(90deg, #fff 0 4px, #cfd8e3 4px 6px); }

        @keyframes donutWiggle {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(4deg); }
          70% { transform: rotate(-4deg); }
        }
        .mon-donut { width: 94px; animation: donutWiggle 3.2s ease-in-out infinite; transform-origin: bottom center; }
        .donut-ring {
          width: 94px; height: 94px;
          background: radial-gradient(circle at 35% 35%, var(--donut-glaze) 0%, #e06085 100%);
          border-radius: 50%;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 -6px 0 rgba(0,0,0,0.15), 0 6px 0 rgba(0,0,0,0.08);
          border: 2.5px solid #8c3b52;
        }
        .donut-hole { width: 24px; height: 24px; border-radius: 50%; background: #ebe6dc; border: 2px solid #8c3b52; position: absolute; }
        .donut-eyes { position: absolute; top: 18px; }
        .donut-mouth { position: absolute; bottom: 16px; width: 14px; height: 5px; background: #5c1b2c; border-radius: 3px; transition: height .15s ease, border-radius .15s ease; }
        .donut-mouth.open { height: 12px; border-radius: 6px; }
        .sprinkle { position: absolute; width: 8px; height: 3.5px; border-radius: 2px; }
        .s1 { background: #ffeb3b; top: 12px; left: 24px; transform: rotate(20deg); }
        .s2 { background: #4caf50; top: 18px; right: 20px; transform: rotate(-30deg); }
        .s3 { background: #00bcd4; bottom: 26px; left: 14px; transform: rotate(45deg); }
        .s4 { background: #ff9800; bottom: 18px; right: 20px; transform: rotate(-15deg); }
        .s5 { background: #fff; top: 40px; left: 12px; transform: rotate(60deg); }

        .mon-popcorn { width: 104px; }
        .popcorn-top { position: relative; height: 56px; width: 100%; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
        .kernel-row { display: flex; justify-content: center; }
        .kernel-row span {
          width: 25px; height: 25px; border-radius: 50%; flex-shrink: 0;
          background: #fff2d6; border: 2px solid #3d2b1a;
          margin-left: -7px;
          box-shadow: inset -2px -2px 0 rgba(230, 180, 80, 0.4);
        }
        .kernel-row span:first-child { margin-left: 0; }
        .kernel-row.row-top { margin-bottom: -9px; z-index: 3; }
        .kernel-row.row-mid { margin-bottom: -9px; z-index: 2; }
        .kernel-row.row-bottom { z-index: 1; }
        @keyframes popcornWiggle {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-2deg); }
          60% { transform: rotate(2deg); }
        }
        .mon-popcorn { animation: popcornWiggle 2.8s ease-in-out infinite; transform-origin: bottom center; }
        .popcorn-bucket {
          width: 104px; height: 104px;
          background: repeating-linear-gradient(90deg, #fff6ec 0 13px, var(--popcorn-red) 13px 23px);
          border: 2.5px solid #3d2b1a;
          clip-path: polygon(4% 0%, 96% 0%, 75% 100%, 25% 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          padding-top: 6px;
          box-shadow: 0 6px 0 rgba(0,0,0,0.1);
        }
        .popcorn-mouth { width: 22px; height: 8px; background: #3d2b1a; border-radius: 4px; overflow: hidden; transition: height .15s ease; display: flex; }
        .popcorn-mouth.open { height: 15px; border-radius: 8px; background: #fff; }
        .popcorn-mouth .teeth { width: 100%; background: repeating-linear-gradient(90deg, #fff 0 4px, #cfd8e3 4px 6px); }

        @keyframes sodaFizz {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-7px) rotate(-3deg); }
          55% { transform: translateY(1px) rotate(0deg); }
          80% { transform: translateY(-3px) rotate(3deg); }
        }
        .mon-soda { width: 74px; animation: sodaFizz 2.6s ease-in-out infinite; transform-origin: bottom center; }
        .soda-tab { width: 18px; height: 9px; border-radius: var(--radius-sm); background: linear-gradient(180deg, #e8e8e8, #a8a8a8); border: 2px solid #3d2b1a; margin: 0 auto -2px; position: relative; z-index: 3; }
        .soda-can {
          width: 74px; height: 124px;
          background: linear-gradient(180deg, #e6314a 0%, #c8102e 100%);
          border: 2.5px solid #3d2b1a;
          border-radius: var(--radius-md);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 0 rgba(0,0,0,0.12);
        }
        .soda-can::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 16px;
          background: linear-gradient(180deg, #f0f0f0, #b0b0b0);
          border-bottom: 2px solid #3d2b1a;
          z-index: 1;
        }
        .soda-can::after {
          content: "";
          position: absolute; bottom: 0; left: 0; right: 0; height: 10px;
          background: linear-gradient(180deg, #b0b0b0, #8a8a8a);
          border-top: 2px solid #3d2b1a;
          z-index: 1;
        }
        .soda-label { position: absolute; top: 42%; left: -25%; right: -25%; height: 26%; background: #fff; opacity: 0.92; transform: rotate(-9deg); z-index: 1; }
        .soda-mouth { width: 18px; height: 7px; background: #1c1c1c; border-radius: var(--radius-sm); z-index: 2; position: relative; transition: height .15s ease, width .15s ease; }
        .soda-mouth.open { height: 16px; width: 16px; border-radius: 50%; }
        
        .logo { display: flex; justify-content: flex-start; align-items: center; margin-bottom: 12px; }
        .brand-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #7a4a35;
          background: rgba(122, 74, 53, 0.08);
          padding: 3px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(122, 74, 53, 0.16);
          display: inline-block;
        }
        .right-panel h1 {
          text-align: left;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 6px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .right-panel .sub {
          text-align: left;
          font-size: 14.5px;
          color: #64748b;
          margin: 0 0 22px;
          line-height: 1.4;
        }
        .field { margin-bottom: 15px; }
        .field label { display: block; font-size: 13.5px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
        .field-input {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          padding: 8px 12px;
          min-height: 44px;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .field-input:hover {
          border-color: #94a3b8;
          background: #f1f5f9;
        }
        .field-input:focus-within {
          border-color: #ff8a3d;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 138, 61, 0.22);
        }
        .field-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          color: #0f172a;
          background: transparent;
          padding: 2px 0;
          font-family: inherit;
        }
        .field-input input::placeholder { color: #94a3b8; font-size: 14px; }
        .field-input input:-webkit-autofill,
        .field-input input:-webkit-autofill:hover, 
        .field-input input:-webkit-autofill:focus, 
        .field-input input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          box-shadow: 0 0 0 30px #ffffff inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .field-input button {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
          display: flex;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: color 0.15s ease;
        }
        .field-input button:hover {
          color: #0f172a;
        }
        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 8px 0 20px;
          font-size: 14px;
          color: #475569;
        }
        .row-between a { color: #7a4a35; text-decoration: none; font-weight: 600; }
        .row-between a:hover { text-decoration: underline; }
        .remember {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          user-select: none;
        }
        .remember input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #ff8a3d;
          border-radius: var(--radius-sm);
          margin: 0;
          flex-shrink: 0;
        }
        .btn-primary {
          width: 100%;
          padding: 13px 0;
          border-radius: var(--radius-md);
          border: none;
          background: #0f172a;
          color: #fff;
          font-size: 15.5px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 4px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-primary:hover { background: #1e293b; transform: translateY(-1px); }
        .footer-text { text-align: left; font-size: 14px; color: #64748b; margin-top: 20px; }
        .footer-text button { border: none; background: transparent; color: #0f172a; font-weight: 700; cursor: pointer; font-size: 14px; text-decoration: underline; margin-left: 4px; }
        .auth-error-box {
          background: #fee2e2;
          border: 1px solid #ef4444;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          margin-bottom: 16px;
          text-align: left;
          font-weight: 500;
        }

        .pw-checklist {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 8px 12px;
          font-size: 11.5px;
          text-align: left;
        }
        .pw-rule-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .pw-rule-chip.met {
          color: #16a34a;
          font-weight: 700;
        }
        .pw-rule-chip span {
          font-size: 11px;
          font-weight: 800;
        }

        /* --- RESPONSIVE ADAPTATIONS: TV, LAPTOP, TABLET, MOBILE --- */
        @media (min-width: 1920px) {
          .auth-app { max-width: 1060px; }
          .auth-card { min-height: 640px; }
          .monsters { transform: scale(1.2); gap: 20px; }
          .brand-name { font-size: 24px; }
          .right-panel h1 { font-size: 28px; }
        }

        @media (max-width: 860px) {
          .auth-app { width: 94%; max-width: 520px; }
          .auth-card { flex-direction: column; min-height: auto; border-radius: var(--radius-lg); }
          .left-panel, .right-panel { position: relative !important; width: 100% !important; left: 0 !important; }
          .left-panel { min-height: 230px; padding: 22px 16px 14px; }
          .stage-banner { padding-top: 0; }
          .stage-badge { font-size: 13px; padding: 4px 12px; }
          .stage-tagline { font-size: 12.5px; margin-top: 4px; }
          .monsters { transform: scale(0.74); transform-origin: center bottom; margin-bottom: 0; gap: 10px; }
          .stage-ground { width: 260px; height: 10px; margin-top: -4px; }
          .right-panel { padding: 28px 24px 34px; }
          .brand-name { font-size: 18px; }
          .right-panel h1 { font-size: 22px; }
          .right-panel .sub { font-size: 13.5px; margin-bottom: 16px; }
          .field { margin-bottom: 13px; }
          .btn-primary { padding: 13px 0; font-size: 15px; }
        }

        @media (max-width: 420px) {
          .auth-app { width: 96%; }
          .monsters { transform: scale(0.64); gap: 6px; }
          .right-panel { padding: 22px 18px 28px; }
          .field-input input { font-size: 15px; }
          .pw-checklist { grid-template-columns: 1fr; gap: 4px; }
        }
      `}</style>

      {onClose && (
        <button
          type="button"
          className="auth-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
      )}

      <div className="auth-card">
        <div className={`left-panel ${mode === "login" ? "at-left" : "at-right"}`}>
          <Monsters mouse={mouse} passwordFocused={passwordFocused} emailTyping={emailTyping} />
        </div>

        <div className={`right-panel ${mode === "login" ? "at-right" : "at-left"}`}>
          <div className="logo">
            <span className="brand-name">REELIST</span>
          </div>
          <div className="form-fade" style={{ opacity: fieldsVisible ? 1 : 0 }}>
            <h1>{mode === "login" ? "Sign in to your account" : "Create your account"}</h1>
            <p className="sub">
              {mode === "login"
                ? "Sign in to access your cinema marquee"
                : "Join Reelist to explore movies"}
            </p>

            {error && <div className="auth-error-box">{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              {mode === "signup" && (
                <div className="field">
                  <label>Name</label>
                  <div className="field-input">
                    <input
                      type="text"
                      name="reelist_user_name"
                      autoComplete="off"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                      }}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <div className="field-input">
                  <input
                    type="email"
                    name="reelist_account_email"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={email}
                    placeholder="example@cinema.com"
                    required
                    onChange={handleEmailChange}
                  />
                </div>
              </div>
              <div className="field" style={{ marginBottom: mode === "signup" ? 14 : 12 }}>
                <label>Password</label>
                <div className="field-input">
                  <input
                    type={showPw ? "text" : "password"}
                    name="reelist_account_password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={mode === "signup" ? "Create a secure password" : ""}
                    required
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {mode === "signup" && (
                  <div className="pw-checklist">
                    <div className={`pw-rule-chip ${pwRules.length ? "met" : ""}`}>
                      <span>{pwRules.length ? "✓" : "○"}</span> 8+ Characters
                    </div>
                    <div className={`pw-rule-chip ${pwRules.upper ? "met" : ""}`}>
                      <span>{pwRules.upper ? "✓" : "○"}</span> 1 Capital (A-Z)
                    </div>
                    <div className={`pw-rule-chip ${pwRules.number ? "met" : ""}`}>
                      <span>{pwRules.number ? "✓" : "○"}</span> 1 Number (0-9)
                    </div>
                    <div className={`pw-rule-chip ${pwRules.special ? "met" : ""}`}>
                      <span>{pwRules.special ? "✓" : "○"}</span> 1 Symbol (!@#$)
                    </div>
                  </div>
                )}
              </div>

              <div className="row-between">
                {mode === "login" ? (
                  <label className="remember">
                    <input type="checkbox" />
                    Remember me
                  </label>
                ) : (
                  <label className="remember">
                    <input type="checkbox" required />
                    I agree to the terms
                  </label>
                )}
              </div>

              <button type="submit" className="btn-primary">
                {mode === "login" ? "Sign In" : "Create account"}
              </button>
            </form>

            <p className="footer-text">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Sign Up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
