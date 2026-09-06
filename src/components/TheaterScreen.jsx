import { useState, useRef } from 'react';

const REELIST_LETTERS = ['R', 'E', 'E', 'L', 'I', 'S', 'T'];

export default function TheaterScreen({ onEnter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const soundPlayed = useRef(false);

  // Web Audio synthesizer: Slow 0.50x curtain sound + letter notes + Text Zoom Whoosh
  const playCinematicAudio = () => {
    if (soundPlayed.current) return;
    soundPlayed.current = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Slow, luxurious velvet curtain traveler track (2.2s duration)
      const trackDur = 2.2;
      const bufSize = Math.floor(ctx.sampleRate * trackDur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const p = i / bufSize;
        const env = Math.sin(p * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.35;
      }
      const trackNoise = ctx.createBufferSource();
      trackNoise.buffer = buf;

      const trackFilter = ctx.createBiquadFilter();
      trackFilter.type = 'bandpass';
      trackFilter.frequency.setValueAtTime(600, now);
      trackFilter.frequency.exponentialRampToValueAtTime(240, now + trackDur);
      trackFilter.Q.setValueAtTime(2.0, now);

      const trackGain = ctx.createGain();
      trackGain.gain.setValueAtTime(0.01, now);
      trackGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
      trackGain.gain.exponentialRampToValueAtTime(0.001, now + trackDur);

      trackNoise.connect(trackFilter);
      trackFilter.connect(trackGain);
      trackGain.connect(ctx.destination);

      trackNoise.start(now);
      trackNoise.stop(now + trackDur);

      // 2. Ascending harmonic zoom chimes for each of the 7 REELIST letters
      const letterPitches = [
        261.63, // R: C4
        293.66, // E: D4
        329.63, // E: E4
        392.00, // L: G4
        440.00, // I: A4
        523.25, // S: C5
        659.25, // T: E5
      ];

      letterPitches.forEach((freq, i) => {
        const delay = 0.25 + i * 0.18;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.001, now + delay);
        oscGain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.55);
      });

      // 3. Cinematic Sub-Bass Hit when full title is complete (t = 1.85s)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now + 1.85);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 2.4);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, now + 1.85);
      subGain.gain.linearRampToValueAtTime(0.35, now + 1.9);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(now + 1.85);
      subOsc.stop(now + 2.45);

      // 4. High-Speed "Text Zoom" Through Whoosh Riser (t = 1.95s)
      const zoomDur = 0.5;
      const zoomOsc = ctx.createOscillator();
      zoomOsc.type = 'sawtooth';
      zoomOsc.frequency.setValueAtTime(140, now + 1.95);
      zoomOsc.frequency.exponentialRampToValueAtTime(880, now + 1.95 + zoomDur);

      const zoomFilter = ctx.createBiquadFilter();
      zoomFilter.type = 'bandpass';
      zoomFilter.frequency.setValueAtTime(400, now + 1.95);
      zoomFilter.frequency.exponentialRampToValueAtTime(2400, now + 1.95 + zoomDur);
      zoomFilter.Q.setValueAtTime(3.0, now + 1.95);

      const zoomGain = ctx.createGain();
      zoomGain.gain.setValueAtTime(0.001, now + 1.95);
      zoomGain.gain.linearRampToValueAtTime(0.35, now + 1.95 + 0.15);
      zoomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.95 + zoomDur);

      zoomOsc.connect(zoomFilter);
      zoomFilter.connect(zoomGain);
      zoomGain.connect(ctx.destination);

      zoomOsc.start(now + 1.95);
      zoomOsc.stop(now + 1.95 + zoomDur);
    } catch {
      // Audio policy ignored safely
    }
  };

  const handleOpenCurtain = () => {
    if (isOpen) return;
    playCinematicAudio();
    setIsOpen(true);

    // TEXT ZOOM: Letters complete at ~1.8s -> zoom straight into website!
    setTimeout(() => {
      setIsZooming(true);
    }, 1950);

    // Transition directly into website with zero empty screen delay
    setTimeout(() => {
      if (onEnter) onEnter();
    }, 2450);
  };

  return (
    <div
      className={`theater-screen-wrapper ${isOpen ? 'theater-screen--open' : ''} ${
        isZooming ? 'theater-screen--zooming' : ''
      }`}
      onClick={handleOpenCurtain}
      onTouchStart={handleOpenCurtain}
      role="button"
      tabIndex={0}
      aria-label="Cinema Theater - Tap or click to open curtains and enter"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleOpenCurtain();
      }}
    >
      <style>{`
        .theater-screen-wrapper {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #000;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          perspective: 1200px;
          transition: opacity 0.5s ease;
        }

        .theater-screen--zooming {
          opacity: 0;
          pointer-events: none;
        }

        /* Ambient Cinema Auditorium Lighting */
        .auditorium-ambient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 35%, rgba(45, 12, 12, 0.6) 0%, #060408 100%);
          pointer-events: none;
        }

        /* -------------------------------------------------------------
           STAGE REVEAL SCREEN: BEHIND THE CURTAINS (REELIST IN BOLD)
           ------------------------------------------------------------- */
        .stage-reveal-screen {
          position: absolute;
          top: 0;
          bottom: 120px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
          overflow: hidden;
        }

        /* Projector Beam pouring onto the center screen */
        .stage-projector-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 100vh;
          background: radial-gradient(
            ellipse at 50% 25%,
            rgba(255, 235, 170, 0.25) 0%,
            rgba(255, 180, 50, 0.08) 50%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 1.2s ease 0.3s;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .theater-screen--open .stage-projector-glow {
          opacity: 1;
        }

        .theater-screen--zooming .stage-projector-glow {
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        /* Center Title Canvas (NO BLACK BOX - PURE CLEAN FLOATING LETTERS) */
        .stage-screen-canvas {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          max-width: 95vw;
        }

        /* -------------------------------------------------------------
           THE BOLD REELIST "TEXT ZOOM" TITLE
           (Matching "TEXT ZOOM TUTORIAL" GIF reference)
           ------------------------------------------------------------- */
        .reelist-text-zoom-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.2rem, 1vw, 1.2rem);
          margin-bottom: 0;
          transform-origin: center center;
          will-change: transform, opacity;
        }

        /* PURE ZOOM IN ANIMATION FOR EACH LETTER (Matching User GIF) */
        .reelist-char {
          display: inline-block;
          font-family: 'Bebas Neue', 'Inter', 'Impact', sans-serif;
          font-size: clamp(4.5rem, 12vw, 9.5rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: 0.06em;
          opacity: 0;
          transform: scale(0);
          filter: blur(20px) brightness(0.2);
          /* Text Zoom Mask: Video/Cinema Texture masked inside the bold letters */
          background:
            linear-gradient(
              135deg,
              rgba(255, 215, 0, 0.4) 0%,
              rgba(255, 100, 0, 0.3) 50%,
              rgba(180, 20, 50, 0.4) 100%
            ),
            url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop') center center / cover no-repeat,
            linear-gradient(135deg, #12080b 0%, #6b1111 20%, #c2410c 40%, #ffd700 70%, #ffffff 90%, #f59e0b 100%);
          background-size: cover, cover, 250% 250%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1.5px rgba(255, 215, 0, 0.45);
        }

        /* PURE ZOOM IN: Letter launches from depth and zooms straight into view! */
        .theater-screen--open .reelist-char {
          animation:
            letterPureZoomIn 0.55s cubic-bezier(0.16, 0.9, 0.28, 1) forwards,
            moviePanInsideText 8s linear infinite;
        }

        @keyframes letterPureZoomIn {
          0% {
            opacity: 0;
            transform: scale(0) translateZ(-400px);
            filter: blur(20px) brightness(0.2);
          }
          55% {
            opacity: 1;
            transform: scale(1.25) translateZ(50px);
            filter: blur(0px) brightness(1.8);
            text-shadow: 0 0 45px #ffd700, 0 0 80px #ff5500;
          }
          75% {
            transform: scale(0.96) translateZ(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateZ(0);
            filter: blur(0px) brightness(1.15);
            text-shadow: 0 0 25px rgba(255, 215, 0, 0.85), 0 0 50px rgba(255, 120, 0, 0.5);
          }
        }

        @keyframes moviePanInsideText {
          0% { background-position: center, 0% 50%, 0% 50%; }
          50% { background-position: center, 100% 50%, 100% 50%; }
          100% { background-position: center, 0% 50%, 0% 50%; }
        }

        /* -------------------------------------------------------------
           THE "TEXT ZOOM" CLIMAX ANIMATION (Smoothly into website)
           ------------------------------------------------------------- */
        .theater-screen--zooming .reelist-text-zoom-title {
          /* Smooth text zoom right through the screen into the website */
          transform: scale(25);
          opacity: 0;
          filter: blur(4px);
          transition: transform 0.55s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.45s ease;
        }

        .theater-screen--zooming .theater-stage-and-seats {
          transform: translateY(120%);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.4s ease;
        }

        .theater-screen--zooming .theater-top-pelmet {
          transform: translateY(-150%);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.4s ease;
        }

        /* -------------------------------------------------------------
           RED VELVET CURTAINS: SLOW 0.50x OPENING (2.2s Duration)
           ------------------------------------------------------------- */
        .curtain-panel {
          position: absolute;
          top: 0;
          bottom: 120px;
          width: 50%;
          background:
            repeating-linear-gradient(
              90deg,
              #4a0606 0px,
              #781010 12px,
              #b01c1c 24px,
              #5c0a0a 36px,
              #841212 48px
            );
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.85);
          transition: transform 2.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 2.2s ease;
          will-change: transform;
          z-index: 20;
          overflow: hidden;
        }

        .curtain-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 30%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.85) 100%
          );
          pointer-events: none;
        }

        .curtain-panel--left {
          left: 0;
          transform-origin: left center;
          border-right: 2px solid rgba(0, 0, 0, 0.7);
        }

        .curtain-panel--right {
          right: 0;
          transform-origin: right center;
          border-left: 2px solid rgba(0, 0, 0, 0.7);
        }

        .theater-screen--open .curtain-panel--left {
          transform: scaleX(0.06) translateX(-20%);
          opacity: 0.85;
        }

        .theater-screen--open .curtain-panel--right {
          transform: scaleX(0.06) translateX(20%);
          opacity: 0.85;
        }

        .theater-screen--zooming .curtain-panel--left {
          transform: scaleX(0.02) translateX(-120%);
          opacity: 0;
          transition: transform 0.7s ease, opacity 0.5s ease;
        }

        .theater-screen--zooming .curtain-panel--right {
          transform: scaleX(0.02) translateX(120%);
          opacity: 0;
          transition: transform 0.7s ease, opacity 0.5s ease;
        }

        /* Side Drapery Pillars */
        .curtain-side-leg {
          position: absolute;
          top: 0;
          bottom: 120px;
          width: 5vw;
          min-width: 45px;
          background: repeating-linear-gradient(
            90deg,
            #300404 0px,
            #630c0c 10px,
            #8c1414 20px,
            #400606 30px
          );
          box-shadow: 0 0 35px rgba(0, 0, 0, 0.95);
          z-index: 22;
          pointer-events: none;
        }
        .curtain-side-leg--left { left: 0; }
        .curtain-side-leg--right { right: 0; }

        /* -------------------------------------------------------------
           TOP VALANCE PELMET & GOLDEN TASSEL FRINGE (Like GIF)
           ------------------------------------------------------------- */
        .theater-top-pelmet {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
          pointer-events: none;
          transition: transform 1.5s ease 1.2s, opacity 1.5s ease 1.2s;
        }

        .pelmet-red-header {
          height: 38px;
          background: linear-gradient(180deg, #500707 0%, #851212 65%, #630c0c 100%);
          border-bottom: 2px solid #b8860b;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pelmet-title-text {
          color: #ffd700;
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(0.68rem, 1.6vw, 0.82rem);
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.75);
        }

        .gold-fringe-svg {
          width: 100%;
          height: 28px;
          display: block;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7));
        }

        .theater-screen--open .theater-top-pelmet {
          transform: translateY(-100%);
          opacity: 0;
        }


        /* -------------------------------------------------------------
           STAGE FLOOR & AUDIENCE CINEMA SEATS
           ------------------------------------------------------------- */
        .theater-stage-and-seats {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 140px;
          z-index: 25;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: transform 1.5s ease 1.2s, opacity 1.5s ease 1.2s;
        }

        .theater-screen--open .theater-stage-and-seats {
          transform: translateY(100%);
          opacity: 0;
        }

        .theater-stage-lip {
          height: 18px;
          background: linear-gradient(180deg, #613b1f 0%, #3d2412 60%, #1f1107 100%);
          border-top: 2px solid #a8723b;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.9);
          position: relative;
        }

        .stage-footlight-strip {
          position: absolute;
          top: 3px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          padding: 0 5vw;
        }

        .stage-bulb {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffe399;
          box-shadow: 0 0 8px #ffc107, 0 -4px 10px rgba(255, 193, 7, 0.6);
        }

        .theater-seats-container {
          background: #080608;
          height: 122px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .seats-svg-graphic {
          width: 100%;
          height: 100%;
          display: block;
        }

        @media (max-width: 600px) {
          .theater-stage-and-seats { height: 95px; }
          .curtain-panel { bottom: 80px; }
          .curtain-side-leg { bottom: 80px; min-width: 16px; width: 3vw; }
          .stage-reveal-screen { bottom: 80px; }
          .reelist-char { font-size: clamp(2.2rem, 11.5vw, 3.4rem); letter-spacing: 0.02em; }
          .reelist-text-zoom-title { gap: clamp(2px, 1vw, 6px); }
          .pelmet-red-header { height: 30px; }
          .gold-fringe-svg { height: 20px; }
        }
      `}</style>

      {/* Auditorium Background Atmosphere */}
      <div className="auditorium-ambient" />

      {/* STAGE SCREEN (BEHIND CURTAINS): REELIST BOLD "TEXT ZOOM" TITLE */}
      <div className="stage-reveal-screen">
        <div className="stage-projector-glow" />
        <div className="stage-screen-canvas">
          <div className="reelist-text-zoom-title">
            {REELIST_LETTERS.map((char, i) => (
              <span
                key={i}
                className="reelist-char"
                style={{
                  animationDelay: `${0.25 + i * 0.18}s`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Left Velvet Curtain Panel (Opens at 0.50x speed: 2.2s) */}
      <div className="curtain-panel curtain-panel--left" />

      {/* Right Velvet Curtain Panel (Opens at 0.50x speed: 2.2s) */}
      <div className="curtain-panel curtain-panel--right" />

      {/* Permanent Side Legs / Drapery Columns */}
      <div className="curtain-side-leg curtain-side-leg--left" />
      <div className="curtain-side-leg curtain-side-leg--right" />

      {/* Top Valance with Dangling Gold Tassel Fringe */}
      <div className="theater-top-pelmet">
        <div className="pelmet-red-header">
          <span className="pelmet-title-text">★ ★ ★ REELIST PREMIERE CINEMA ★ ★ ★</span>
        </div>
        <svg className="gold-fringe-svg" viewBox="0 0 1200 28" preserveAspectRatio="none">
          <defs>
            <pattern id="tassel-unit" width="24" height="28" patternUnits="userSpaceOnUse">
              <line x1="4" y1="0" x2="4" y2="18" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="0" x2="8" y2="24" stroke="#e6b800" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="0" x2="12" y2="20" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="0" x2="16" y2="26" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="0" x2="20" y2="17" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8" cy="24" r="2" fill="#ffd700" />
              <circle cx="16" cy="26" r="2.5" fill="#ffd700" />
            </pattern>
          </defs>
          <rect width="1200" height="28" fill="url(#tassel-unit)" />
        </svg>
      </div>


      {/* Stage Floor & Audience Cinema Seats */}
      <div className="theater-stage-and-seats">
        <div className="theater-stage-lip">
          <div className="stage-footlight-strip">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="stage-bulb" />
            ))}
          </div>
        </div>

        <div className="theater-seats-container">
          <svg className="seats-svg-graphic" viewBox="0 0 1200 120" preserveAspectRatio="none">
            {/* Row 3 */}
            <g fill="#1f1814" stroke="#120e0b" strokeWidth="1.5">
              {Array.from({ length: 18 }).map((_, i) => {
                const x = 30 + i * 64;
                return (
                  <g key={`r3-${i}`}>
                    <rect x={x} y="8" width="56" height="32" rx="7" />
                    <rect x={x + 4} y="4" width="48" height="12" rx="4" fill="#29201a" />
                  </g>
                );
              })}
            </g>

            {/* Row 2 */}
            <g fill="#2e231d" stroke="#17110e" strokeWidth="2">
              {Array.from({ length: 16 }).map((_, i) => {
                const x = 20 + i * 74;
                return (
                  <g key={`r2-${i}`}>
                    <rect x={x} y="38" width="66" height="42" rx="9" />
                    <rect x={x + 5} y="32" width="56" height="15" rx="5" fill="#3d2f27" />
                    <rect x={x + 2} y="74" width="8" height="10" rx="3" fill="#17110e" />
                    <rect x={x + 56} y="74" width="8" height="10" rx="3" fill="#17110e" />
                  </g>
                );
              })}
            </g>

            {/* Row 1 */}
            <g fill="#3e3027" stroke="#1c1410" strokeWidth="2.5">
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 12 + i * 85;
                return (
                  <g key={`r1-${i}`}>
                    <rect x={x + 7} y="70" width="64" height="18" rx="6" fill="#4d3c31" />
                    <rect x={x} y="78" width="78" height="42" rx="10" />
                    <line x1={x + 39} y1="84" x2={x + 39} y2="114" stroke="#2b2019" strokeWidth="2" />
                    <rect x={x - 3} y="94" width="8" height="26" rx="4" fill="#251a13" />
                    <rect x={x + 73} y="94" width="8" height="26" rx="4" fill="#251a13" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
