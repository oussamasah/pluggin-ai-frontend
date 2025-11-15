import React from 'react';

const GalaxyModernBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#000000]">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a12] to-black" />

      {/* Galaxy stars - multiple layers */}
      {/* Distant stars */}
      {[...Array(150)].map((_, i) => (
        <div
          key={`star-distant-${i}`}
          className="absolute bg-white rounded-full animate-twinkle-slow"
          style={{
            width: `${0.5 + Math.random() * 1}px`,
            height: `${0.5 + Math.random() * 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            opacity: 0.2 + Math.random() * 0.4
          }}
        />
      ))}

      {/* Medium stars */}
      {[...Array(80)].map((_, i) => (
        <div
          key={`star-medium-${i}`}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            width: `${1 + Math.random() * 1.5}px`,
            height: `${1 + Math.random() * 1.5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: 0.4 + Math.random() * 0.5
          }}
        />
      ))}

      {/* Bright stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`star-bright-${i}`}
          className="absolute bg-white rounded-full animate-twinkle-bright"
          style={{
            width: `${1.5 + Math.random() * 2}px`,
            height: `${1.5 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1.5 + Math.random() * 2.5}s`,
            opacity: 0.6 + Math.random() * 0.4,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}

      {/* Green glowing stars */}
      {[...Array(25)].map((_, i) => (
        <div
          key={`star-green-${i}`}
          className="absolute bg-[#a7f205] rounded-full animate-twinkle-glow"
          style={{
            width: `${1.5 + Math.random() * 2.5}px`,
            height: `${1.5 + Math.random() * 2.5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            boxShadow: '0 0 8px rgba(167, 242, 5, 0.9), 0 0 16px rgba(167, 242, 5, 0.5)'
          }}
        />
      ))}

      {/* Rotating circles container - Framer style */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-60 blur-[10px] z-[1]">
        
        {/* Big Circle */}
        <div 
          className="absolute animate-rotate-circle-big"
          style={{
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(167, 242, 5, 0.15), rgba(167, 242, 5, 0.05) 40%, transparent 70%)',
            willChange: 'transform'
          }}
        />

        {/* Small Circle */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-rotate-circle-small"
          style={{
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 40%, rgba(80, 200, 120, 0.2), rgba(167, 242, 5, 0.08) 35%, transparent 65%)',
            willChange: 'transform'
          }}
        />
      </div>

      {/* Center lightning logo - clean and premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]">
        <div className="relative animate-logo-float">
          {/* Glow rings */}
          <div className="absolute inset-0 -m-24">
            <div className="absolute inset-0 border border-[#a7f205] rounded-full opacity-15 animate-ping-elegant" style={{ animationDuration: '5s' }} />
            <div className="absolute inset-0 border border-emerald-400 rounded-full opacity-10 animate-ping-elegant" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
          </div>

          {/* Main logo */}
          <svg width="350" height="350" viewBox="0 0 100 100" className="relative z-10 drop-shadow-[0_0_30px_rgba(167,242,5,0.4)]">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f205" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#a7f205" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#70e000" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 50 20 L 35 50 L 50 50 L 40 80 L 65 45 L 50 45 L 60 20 Z"
              fill="url(#logoGrad)"
              filter="url(#glow)"
              opacity="0.35"
            />
          </svg>

          {/* Inner glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-[#a7f205] rounded-full blur-3xl opacity-15 animate-pulse-glow" />
          </div>
        </div>
      </div>

      {/* Nebula clouds */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#a7f205] rounded-full blur-[140px] opacity-[0.06] animate-nebula-drift-1" />
      <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[150px] opacity-[0.05] animate-nebula-drift-2" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-green-400 rounded-full blur-[120px] opacity-[0.04] animate-nebula-drift-3" />

      {/* Floating mini logos */}
      {[
        { top: '20%', left: '15%', size: 50, delay: 0 },
        { top: '75%', left: '20%', size: 45, delay: 3 },
        { top: '30%', right: '18%', size: 55, delay: 6 },
        { bottom: '25%', right: '22%', size: 48, delay: 9 }
      ].map((props, i) => (
        <div
          key={`mini-logo-${i}`}
          className="absolute animate-mini-logo-float opacity-15"
          style={{
            top: props.top,
            bottom: props.bottom,
            left: props.left,
            right: props.right,
            animationDelay: `${props.delay}s`
          }}
        >
          <svg width={props.size} height={props.size} viewBox="0 0 100 100">
            <path
              d="M 50 20 L 35 50 L 50 50 L 40 80 L 65 45 L 50 45 L 60 20 Z"
              fill="#a7f205"
              opacity="0.5"
            />
          </svg>
        </div>
      ))}

      {/* Orbiting particles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] animate-orbit-slow">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${angle}deg) translateX(400px) translateY(-50%)`,
            }}
          >
            <div 
              className="w-2 h-2 bg-[#a7f205] rounded-full animate-pulse-particle"
              style={{
                boxShadow: '0 0 12px rgba(167, 242, 5, 0.8), 0 0 24px rgba(167, 242, 5, 0.4)',
                animationDelay: `${i * 0.4}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Shooting stars */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="absolute animate-shooting-star"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${i * 5 + Math.random() * 3}s`
          }}
        >
          <div className="w-1 h-1 bg-[#a7f205] rounded-full" style={{
            boxShadow: '0 0 10px rgba(167, 242, 5, 1), 0 0 20px rgba(167, 242, 5, 0.6)'
          }} />
        </div>
      ))}

      {/* Energy waves */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[1, 2, 3].map((i) => (
          <div
            key={`wave-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a7f205] opacity-0 animate-energy-pulse"
            style={{
              animationDelay: `${i * 2.5}s`,
              boxShadow: '0 0 20px rgba(167, 242, 5, 0.4)'
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      <style jsx>{`
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes twinkle-bright {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes twinkle-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }

        @keyframes rotate-circle-big {
          0% { transform: rotate(-24.192deg); }
          100% { transform: rotate(335.808deg); }
        }

        @keyframes rotate-circle-small {
          0% { transform: translate(-50%, -50%) rotate(80.64deg); }
          100% { transform: translate(-50%, -50%) rotate(440.64deg); }
        }

        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes ping-elegant {
          0% { transform: scale(0.95); opacity: 0.15; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }

        @keyframes nebula-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, -30px); }
        }

        @keyframes nebula-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-50px, 40px); }
        }

        @keyframes nebula-drift-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 50px); }
        }

        @keyframes mini-logo-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(15px, -25px) rotate(5deg); }
          66% { transform: translate(-20px, -15px) rotate(-5deg); }
        }

        @keyframes orbit-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes pulse-particle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes shooting-star {
          0% { transform: translate(0, 0) rotate(-45deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.7; }
          100% { transform: translate(400px, 400px) rotate(-45deg); opacity: 0; }
        }

        @keyframes energy-pulse {
          0% { width: 250px; height: 250px; opacity: 0.4; }
          100% { width: 900px; height: 900px; opacity: 0; }
        }

        .animate-twinkle-slow { animation: twinkle-slow 5s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-twinkle-bright { animation: twinkle-bright 2s ease-in-out infinite; }
        .animate-twinkle-glow { animation: twinkle-glow 3s ease-in-out infinite; }
        .animate-rotate-circle-big { animation: rotate-circle-big 40s linear infinite; }
        .animate-rotate-circle-small { animation: rotate-circle-small 30s linear infinite; }
        .animate-logo-float { animation: logo-float 8s ease-in-out infinite; }
        .animate-ping-elegant { animation: ping-elegant 5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-glow { animation: pulse-glow 6s ease-in-out infinite; }
        .animate-nebula-drift-1 { animation: nebula-drift-1 35s ease-in-out infinite; }
        .animate-nebula-drift-2 { animation: nebula-drift-2 40s ease-in-out infinite; }
        .animate-nebula-drift-3 { animation: nebula-drift-3 45s ease-in-out infinite; }
        .animate-mini-logo-float { animation: mini-logo-float 20s ease-in-out infinite; }
        .animate-orbit-slow { animation: orbit-slow 70s linear infinite; }
        .animate-pulse-particle { animation: pulse-particle 3s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 4s ease-out infinite; }
        .animate-energy-pulse { animation: energy-pulse 7s ease-out infinite; }
      `}</style>
    </div>
  );
};

export default GalaxyModernBackground;