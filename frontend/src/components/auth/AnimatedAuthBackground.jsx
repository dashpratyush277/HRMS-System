const AnimatedAuthBackground = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Radial gradient base layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(139,92,246,0.10),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(99,102,241,0.08),transparent)]" />

      {/* Floating glowing orbs */}
      <div
        className="auth-orb absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-3xl"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="auth-orb absolute -bottom-48 -right-32 w-[560px] h-[560px] rounded-full bg-purple-700/15 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="auth-orb absolute top-1/2 -right-20 w-[380px] h-[380px] rounded-full bg-indigo-600/15 blur-3xl"
        style={{ animationDelay: "-11s" }}
      />
      <div
        className="auth-orb absolute top-[20%] left-[60%] w-[260px] h-[260px] rounded-full bg-blue-500/10 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />

      {/* Wave SVG — bottom layer */}
      <svg
        className="auth-wave absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDelay: "0s" }}
      >
        <defs>
          <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="30%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="40%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="none"
          stroke="url(#wg1)"
          strokeWidth="1.5"
          d="M0,200 C240,170 480,230 720,200 C960,170 1200,220 1440,195"
        />
        <path
          fill="none"
          stroke="url(#wg2)"
          strokeWidth="1"
          d="M0,230 C200,210 440,250 720,230 C1000,210 1240,245 1440,225"
        />
        <path
          fill="none"
          stroke="url(#wg3)"
          strokeWidth="0.8"
          d="M0,255 C280,240 520,265 720,250 C920,235 1160,262 1440,248"
        />
      </svg>

      {/* Wave SVG — top layer (inverted, fainter) */}
      <svg
        className="auth-wave absolute top-0 left-0 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDelay: "-5s", opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="wg4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="35%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="none"
          stroke="url(#wg4)"
          strokeWidth="1"
          d="M0,80 C300,50 600,110 900,75 C1100,50 1280,90 1440,70"
        />
        <path
          fill="none"
          stroke="url(#wg4)"
          strokeWidth="0.6"
          d="M0,110 C280,85 540,130 800,105 C1060,80 1280,115 1440,98"
        />
      </svg>

      {/* Star / particle field — fixed positions to avoid layout shift */}
      <div className="auth-particle absolute rounded-full bg-blue-400" style={{ width: 3, height: 3, top: "12%", left: "18%", animationDelay: "0s" }} />
      <div className="auth-particle absolute rounded-full bg-purple-300" style={{ width: 2, height: 2, top: "28%", left: "7%", animationDelay: "-1.4s" }} />
      <div className="auth-particle absolute rounded-full bg-white" style={{ width: 2, height: 2, top: "55%", left: "13%", animationDelay: "-2.8s" }} />
      <div className="auth-particle absolute rounded-full bg-blue-300" style={{ width: 2, height: 2, top: "78%", left: "24%", animationDelay: "-0.7s" }} />
      <div className="auth-particle absolute rounded-full bg-indigo-400" style={{ width: 3, height: 3, top: "8%", left: "72%", animationDelay: "-2.1s" }} />
      <div className="auth-particle absolute rounded-full bg-purple-400" style={{ width: 2, height: 2, top: "42%", left: "85%", animationDelay: "-3.5s" }} />
      <div className="auth-particle absolute rounded-full bg-white" style={{ width: 2, height: 2, top: "68%", left: "78%", animationDelay: "-1.8s" }} />
      <div className="auth-particle absolute rounded-full bg-blue-200" style={{ width: 3, height: 3, top: "22%", left: "52%", animationDelay: "-4.2s" }} />
      <div className="auth-particle absolute rounded-full bg-indigo-300" style={{ width: 2, height: 2, top: "88%", left: "62%", animationDelay: "-0.3s" }} />
      <div className="auth-particle absolute rounded-full bg-purple-300" style={{ width: 3, height: 3, top: "5%", left: "38%", animationDelay: "-3.1s" }} />
      <div className="auth-particle absolute rounded-full bg-blue-400" style={{ width: 2, height: 2, top: "93%", left: "44%", animationDelay: "-1.0s" }} />
      <div className="auth-particle absolute rounded-full bg-white" style={{ width: 2, height: 2, top: "18%", left: "92%", animationDelay: "-4.7s" }} />
      <div className="auth-particle absolute rounded-full bg-indigo-400" style={{ width: 2, height: 2, top: "48%", left: "30%", animationDelay: "-2.5s" }} />
      <div className="auth-particle absolute rounded-full bg-blue-300" style={{ width: 3, height: 3, top: "72%", left: "90%", animationDelay: "-3.8s" }} />
      <div className="auth-particle absolute rounded-full bg-purple-200" style={{ width: 2, height: 2, top: "35%", left: "65%", animationDelay: "-0.9s" }} />
      <div className="auth-particle absolute rounded-full bg-white" style={{ width: 2, height: 2, top: "82%", left: "5%", animationDelay: "-2.2s" }} />
      <div className="auth-particle absolute rounded-full bg-blue-400" style={{ width: 3, height: 3, top: "60%", left: "46%", animationDelay: "-4.0s" }} />
      <div className="auth-particle absolute rounded-full bg-indigo-300" style={{ width: 2, height: 2, top: "3%", left: "58%", animationDelay: "-1.6s" }} />
    </div>
  );
};

export default AnimatedAuthBackground;
