import { useState, useEffect, useRef } from "react";

type Emotion =
  | "love"
  | "anger"
  | "joy"
  | "sadness"
  | "fear"
  | "surprise";

interface EmotionConfig {
  label: string;
  emoji: string;
  character: string;
  bg: string;
  blobA: string;
  blobB: string;
  blobC: string;
  cardBg: string;
  accent: string;
  textColor: string;
  animation: string;
  description: string;
  particles: string[];
}

const EMOTIONS: Record<Emotion, EmotionConfig> = {
  love: {
    label: "Love",
    emoji: "😍",
    character: "🥰",
    bg: "linear-gradient(135deg, #ff6eb4 0%, #ffb3d9 50%, #ff85c2 100%)",
    blobA: "#ff94cc",
    blobB: "#ffcce8",
    blobC: "#ff5aa8",
    cardBg: "rgba(255,255,255,0.85)",
    accent: "#e91e8c",
    textColor: "#8b0057",
    animation: "anim-float",
    description: "Aww, that's so sweet!",
    particles: ["💕", "❤️", "💖", "💗", "✨"],
  },
  anger: {
    label: "Anger",
    emoji: "😡",
    character: "🤬",
    bg: "linear-gradient(135deg, #ff3c3c 0%, #ff7043 50%, #c62828 100%)",
    blobA: "#ff5252",
    blobB: "#ff8a65",
    blobC: "#b71c1c",
    cardBg: "rgba(255,255,255,0.88)",
    accent: "#d32f2f",
    textColor: "#7f0000",
    animation: "anim-shake",
    description: "Whoa, take a deep breath!",
    particles: ["💢", "🔥", "⚡", "💥", "😤"],
  },
  joy: {
    label: "Joy",
    emoji: "😄",
    character: "🤩",
    bg: "linear-gradient(135deg, #ffe234 0%, #ffab00 50%, #ff9800 100%)",
    blobA: "#ffe57a",
    blobB: "#ffd740",
    blobC: "#ff6d00",
    cardBg: "rgba(255,255,255,0.87)",
    accent: "#f57f17",
    textColor: "#6d4c00",
    animation: "anim-bounce",
    description: "Woohoo! Such happiness!",
    particles: ["🎉", "⭐", "✨", "🌟", "🎊"],
  },
  sadness: {
    label: "Sadness",
    emoji: "😢",
    character: "😭",
    bg: "linear-gradient(135deg, #5c8dd6 0%, #90caf9 50%, #3a6bc7 100%)",
    blobA: "#74a7e0",
    blobB: "#aed6f1",
    blobC: "#2e5ea8",
    cardBg: "rgba(255,255,255,0.88)",
    accent: "#1565c0",
    textColor: "#0d2d6e",
    animation: "anim-pulse",
    description: "It's okay to feel this way...",
    particles: ["💧", "🌧️", "😔", "💙", "🫂"],
  },
  fear: {
    label: "Fear",
    emoji: "😨",
    character: "😱",
    bg: "linear-gradient(135deg, #7b4f9e 0%, #b39ddb 50%, #4a148c 100%)",
    blobA: "#9575cd",
    blobB: "#ce93d8",
    blobC: "#38006b",
    cardBg: "rgba(255,255,255,0.88)",
    accent: "#6a1b9a",
    textColor: "#38006b",
    animation: "anim-wiggle",
    description: "Ooh, spooky stuff!",
    particles: ["👻", "😰", "🕷️", "⚡", "🌑"],
  },
  surprise: {
    label: "Surprise",
    emoji: "😮",
    character: "🤯",
    bg: "linear-gradient(135deg, #00bcd4 0%, #80deea 50%, #006064 100%)",
    blobA: "#26c6da",
    blobB: "#80deea",
    blobC: "#00838f",
    cardBg: "rgba(255,255,255,0.88)",
    accent: "#0097a7",
    textColor: "#004d54",
    animation: "anim-spin",
    description: "Wait... WHAT?! No way!",
    particles: ["🤯", "💥", "❓", "⭐", "🌀"],
  },
};

interface PredictionResponse {
  predicted_emotion: Emotion;
  confidence: number;
}

interface Particle {
  id: number;
  symbol: string;
  x: number;
  delay: number;
}

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ emotion: Emotion; confidence: number; keywords: string[] } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentBg, setCurrentBg] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animKey, setAnimKey] = useState(0);
  const particleId = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = result ? EMOTIONS[result.emotion] : null;

  const spawnParticles = (emotion: Emotion) => {
    const cfg = EMOTIONS[emotion];
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: particleId.current++,
      symbol: cfg.particles[i % cfg.particles.length],
      x: 10 + Math.random() * 80,
      delay: i * 120,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const analyze = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed with status ${response.status}`);
      }

      const prediction = (await response.json()) as PredictionResponse;
      const detected = {
        emotion: prediction.predicted_emotion,
        confidence: prediction.confidence,
        keywords: [],
      };
      setResult(detected);
      setCurrentBg(EMOTIONS[detected.emotion].bg);
      setAnimKey((k) => k + 1);
      spawnParticles(detected.emotion);
    } catch (error) {
      console.error("Unable to analyze sentiment", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      analyze();
    }
  };

  const reset = () => {
    setText("");
    setResult(null);
    setCurrentBg("linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)");
    textareaRef.current?.focus();
  };

  // Dynamic border color for input
  const inputBorderColor = config ? config.accent : "#a78bfa";
  const inputGlow = config ? `0 0 0 3px ${config.accent}33, 0 4px 24px ${config.accent}44` : "0 0 0 3px #a78bfa44";

  return (
    <div
      className="emotion-bg min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-10"
      style={{ background: currentBg }}
    >
      {/* Memphis geometric background shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {/* Blob A */}
        <div
          className="blob1 absolute rounded-full opacity-30"
          style={{
            width: 520,
            height: 520,
            top: "-120px",
            left: "-120px",
            background: config ? config.blobA : "#a78bfa",
            filter: "blur(80px)",
            transition: "background 1.2s ease",
          }}
        />
        {/* Blob B */}
        <div
          className="blob2 absolute rounded-full opacity-25"
          style={{
            width: 400,
            height: 400,
            bottom: "-80px",
            right: "-80px",
            background: config ? config.blobB : "#c4b5fd",
            filter: "blur(70px)",
            transition: "background 1.2s ease",
          }}
        />
        {/* Blob C */}
        <div
          className="blob3 absolute rounded-full opacity-20"
          style={{
            width: 280,
            height: 280,
            top: "40%",
            right: "10%",
            background: config ? config.blobC : "#7c3aed",
            filter: "blur(60px)",
            transition: "background 1.2s ease",
          }}
        />

        {/* Memphis geometric decorations */}
        <div
          className="geo-rotate absolute border-4 border-white opacity-10"
          style={{ width: 120, height: 120, top: "8%", right: "15%", borderRadius: "30%" }}
        />
        <div
          className="geo-rotate-rev absolute border-4 border-white opacity-10"
          style={{ width: 80, height: 80, bottom: "15%", left: "8%", borderRadius: "50%" }}
        />
        <div
          className="geo-rotate absolute opacity-10"
          style={{
            width: 60,
            height: 60,
            top: "60%",
            left: "5%",
            background: "white",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
        <div
          className="geo-rotate-rev absolute opacity-10"
          style={{
            width: 50,
            height: 50,
            top: "20%",
            left: "20%",
            background: "white",
            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="star-particle text-2xl"
            style={{
              left: `${p.x}%`,
              bottom: "35%",
              animationDelay: `${p.delay}ms`,
            }}
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div
        className="relative w-full max-w-xl"
        style={{ zIndex: 10 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-5xl">🧠</span>
          </div>
          <h1
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              color: "white",
              textShadow: "0 3px 12px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.3)",
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            Emotion Detector
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 700,
              fontSize: "1.05rem",
              marginTop: "6px",
              textShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            Type anything — I'll feel it for you ✨
          </p>
        </div>

        {/* Input Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            border: "2px solid rgba(255,255,255,0.8)",
          }}
        >
          <label
            style={{
              display: "block",
              fontWeight: 800,
              fontSize: "0.9rem",
              color: config ? config.textColor : "#4c1d95",
              marginBottom: "10px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              transition: "color 0.6s ease",
            }}
          >
            Enter your sentence
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="How are you feeling today? Share anything..."
            rows={3}
            className="input-field w-full resize-none"
            style={{
              border: `2.5px solid ${config ? config.accent : "#a78bfa"}`,
              borderRadius: "16px",
              padding: "14px 16px",
              fontSize: "1.05rem",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              color: "#1a1a2e",
              background: "rgba(255,255,255,0.95)",
              boxShadow: analyzing || result ? inputGlow : "none",
              transition: "border-color 0.6s ease, box-shadow 0.4s ease",
            }}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={analyze}
              disabled={!text.trim() || analyzing}
              style={{
                flex: 1,
                padding: "14px 24px",
                borderRadius: "14px",
                border: "none",
                cursor: text.trim() && !analyzing ? "pointer" : "not-allowed",
                fontFamily: "'Fredoka One', cursive",
                fontSize: "1.2rem",
                letterSpacing: "0.03em",
                color: "white",
                background: config
                  ? `linear-gradient(135deg, ${config.accent}, ${config.blobA})`
                  : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                boxShadow: config
                  ? `0 4px 18px ${config.accent}66`
                  : "0 4px 18px #7c3aed55",
                transform: text.trim() && !analyzing ? "translateY(0)" : "translateY(0)",
                transition: "all 0.3s ease",
                opacity: !text.trim() ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (text.trim() && !analyzing) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
              }}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span>Analyzing</span>
                  <span className="flex gap-1">
                    <span className="dot1 inline-block w-2 h-2 rounded-full bg-white" />
                    <span className="dot2 inline-block w-2 h-2 rounded-full bg-white" />
                    <span className="dot3 inline-block w-2 h-2 rounded-full bg-white" />
                  </span>
                </span>
              ) : (
                "Detect Emotion ⚡"
              )}
            </button>
            {result && (
              <button
                onClick={reset}
                style={{
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: `2px solid ${config?.accent || "#a78bfa"}`,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: config?.accent || "#7c3aed",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = config?.accent || "#7c3aed";
                  (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "white";
                  (e.currentTarget as HTMLButtonElement).style.color = config?.accent || "#7c3aed";
                }}
              >
                Reset
              </button>
            )}
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#94a3b8",
              marginTop: "10px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Press Enter to analyze · Shift+Enter for new line
          </p>
        </div>

        {/* Result Card */}
        {result && config && (
          <div
            key={animKey}
            className="slide-up mt-5"
            style={{
              background: config.cardBg,
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              padding: "28px",
              boxShadow: `0 20px 60px ${config.accent}33, 0 4px 16px rgba(0,0,0,0.1)`,
              border: `2px solid ${config.accent}44`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative corner blobs */}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: config.accent,
                opacity: 0.08,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: config.blobA,
                opacity: 0.1,
              }}
            />

            {/* Character + emotion label row */}
            <div className="flex items-center gap-5">
              {/* Animated character */}
              <div className="relative">
                <div
                  className={config.animation}
                  style={{
                    fontSize: "5rem",
                    lineHeight: 1,
                    display: "block",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                  }}
                >
                  {config.character}
                </div>
              </div>

              {/* Emotion info */}
              <div className="flex-1">
                <div className="label-pop" style={{ display: "inline-block", marginBottom: "6px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: config.accent,
                      color: "white",
                      padding: "4px 14px",
                      borderRadius: "999px",
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: "1rem",
                      letterSpacing: "0.04em",
                      boxShadow: `0 3px 10px ${config.accent}55`,
                    }}
                  >
                    {config.emoji} {config.label}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: "1.3rem",
                    color: config.textColor,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {config.description}
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ marginTop: "22px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  color: config.textColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <span>Confidence</span>
                <span>{Math.round(result.confidence * 100)}%</span>
              </div>
              <div
                style={{
                  height: "12px",
                  background: `${config.accent}22`,
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="fill-bar"
                  style={{
                    height: "100%",
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, ${config.blobA}, ${config.accent})`,
                    "--target-width": `${Math.round(result.confidence * 100)}%`,
                    boxShadow: `0 2px 8px ${config.accent}66`,
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Keywords */}
            {result.keywords.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    color: config.textColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  Key signals
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {result.keywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: `${config.accent}18`,
                        color: config.accent,
                        border: `1.5px solid ${config.accent}44`,
                        borderRadius: "999px",
                        padding: "3px 12px",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                      }}
                    >
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotion spectrum dots */}
            <div style={{ marginTop: "20px" }}>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  color: config.textColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "10px",
                }}
              >
                Emotion spectrum
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {(Object.entries(EMOTIONS) as [Emotion, EmotionConfig][]).map(([key, cfg]) => (
                  <div
                    key={key}
                    title={cfg.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      opacity: key === result.emotion ? 1 : 0.35,
                      transform: key === result.emotion ? "scale(1.25)" : "scale(1)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{cfg.emoji}</span>
                    <span style={{ fontSize: "0.6rem", fontWeight: 800, color: cfg.accent, textTransform: "uppercase" }}>
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Example prompts */}
        {!result && !analyzing && (
          <div className="mt-5">
            <p
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Try these ✨
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { text: "I love you so much! 💕", emotion: "love" },
                { text: "This makes me so angry!", emotion: "anger" },
                { text: "Today is the best day ever!", emotion: "joy" },
                { text: "I'm feeling really scared...", emotion: "fear" },
                { text: "Wow, I can't believe this!", emotion: "surprise" },
              ].map((ex) => (
                <button
                  key={ex.text}
                  onClick={() => setText(ex.text)}
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(10px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    borderRadius: "999px",
                    padding: "7px 14px",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.32)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }}
                >
                  {ex.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          position: "fixed",
          bottom: "16px",
          color: "rgba(255,255,255,0.5)",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          zIndex: 10,
        }}
      >
        Emotion Detector · Rule-based NLP
      </p>
    </div>
  );
}
