import React, { useState, useEffect, useRef } from "react";
import { Lock, Send, Users, ShieldCheck, Sparkles, TrendingDown, BookHeart, MessageCircle, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

/* ---------- Design tokens ----------
  --bg        #EAEDF3  dusty blue-lavender wash (the "waiting room" calm)
  --surface   #FFFFFF
  --ink       #333A4D  deep slate, not pure black
  --primary   #7C86A6  muted blue-gray
  --primary-soft #DDE1EC
  --accent    #A79BC9  soft lavender (signature)
  --alert     #B5493B  reserved only for crisis state, never decorative
------------------------------------- */

const moodData = [
  { day: "Mon", score: 6.8 },
  { day: "Tue", score: 6.2 },
  { day: "Wed", score: 5.5 },
  { day: "Thu", score: 5.1 },
  { day: "Fri", score: 5.9 },
];

const themes = [
  { label: "Deadline pressure", pct: 62 },
  { label: "Meeting overload", pct: 44 },
  { label: "Unclear priorities", pct: 31 },
];

const moods = [
  { key: "sad", label: "Sad", glyph: "🙁" },
  { key: "neutral", label: "Neutral", glyph: "😐" },
  { key: "happy", label: "Happy", glyph: "🙂" },
];

function BreathingWidget({ onComplete }) {
  const phases = [
    { key: "in",    label: "Breathe in",  seconds: 4, scale: 1.4 },
    { key: "hold1", label: "Hold",        seconds: 4, scale: 1.4 },
    { key: "out",   label: "Breathe out", seconds: 4, scale: 0.7 },
    { key: "hold2", label: "Hold",        seconds: 4, scale: 0.7 },
  ];

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].seconds);
  const [cycle, setCycle] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const totalCycles = 3;

  const phaseIndexRef = useRef(phaseIndex);
  phaseIndexRef.current = phaseIndex;

  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const currentPhaseIdx = phaseIndexRef.current;
          const currentCycle = cycleRef.current;

          // If this is the last phase of the target cycle, complete the exercise
          if (currentPhaseIdx === phases.length - 1 && currentCycle >= totalCycles) {
            clearInterval(interval);
            onCompleteRef.current();
            return 0;
          }

          // Transition to next phase
          const nextIndex = (currentPhaseIdx + 1) % phases.length;
          setPhaseIndex(nextIndex);
          if (nextIndex === 0) {
            setCycle((c) => c + 1);
          }
          return -1; // Reset trigger
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (secondsLeft === -1) {
      setSecondsLeft(phases[phaseIndex].seconds);
    }
  }, [phaseIndex, secondsLeft]);

  const currentPhase = phases[phaseIndex];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full flex flex-col items-center text-center space-y-5 mx-auto animate-fade-in-up">
      <span className="text-xs uppercase tracking-wider font-semibold text-[#7C86A6]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        Box Breathing
      </span>

      {/* Phase Label */}
      <div className="text-sm font-semibold text-[#7C86A6]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        {currentPhase.label}
      </div>

      {/* Animated breathing circle */}
      <div className="relative flex items-center justify-center w-52 h-52">
        {/* Glow backplate */}
        <div 
          className="absolute rounded-full bg-[#A79BC9]/10 transition-transform duration-[4000ms] ease-in-out"
          style={{ 
            transform: `scale(${currentPhase.scale * 1.35})`,
            width: '120px',
            height: '120px'
          }}
        />
        {/* Breathing Circle */}
        <div 
          className="absolute rounded-full bg-[#A79BC9] flex flex-col items-center justify-center transition-transform duration-[4000ms] ease-in-out shadow-sm"
          style={{ 
            transform: `scale(${currentPhase.scale})`,
            width: '100px',
            height: '100px'
          }}
        >
          <span className="text-2xl font-bold text-white leading-none">
            {secondsLeft === -1 ? currentPhase.seconds : secondsLeft}
          </span>
        </div>
      </div>

      {/* Cycle Indicator */}
      <div className="text-xs text-[#7C86A6] font-medium" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        Cycle {cycle}/{totalCycles}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold border border-[#DDE1EC] text-[#7C86A6] hover:bg-[#F3F4F8] transition-all cursor-pointer"
        >
          {isActive ? "Pause" : "Resume"}
        </button>
        <button 
          onClick={onComplete}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#7C86A6] hover:bg-[#68718F] text-white transition-all cursor-pointer"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function GroundingWidget({ onComplete }) {
  const steps = [
    { key: 5, label: "👁️ 5 things you can SEE around you", placeholders: ["Something bright", "Something small", "Something textured", "Something metal", "Something blue"] },
    { key: 4, label: "🖐️ 4 things you can TOUCH and feel", placeholders: ["Textured desk", "Fabric of your clothes", "Cool glass", "Keycaps"] },
    { key: 3, label: "👂 3 things you can HEAR right now", placeholders: ["A low hum", "Distant voice", "Your own breath"] },
    { key: 2, label: "👃 2 things you can SMELL/identify", placeholders: ["Coffee/tea", "Fresh paper"] },
    { key: 1, label: "👅 1 thing you can TASTE", placeholders: ["Mint/water"] }
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [inputs, setInputs] = useState({ 5: ["", "", "", "", ""], 4: ["", "", "", ""], 3: ["", "", ""], 2: ["", ""], 1: [""] });
  const [completed, setCompleted] = useState(false);

  const handleInputChange = (stepKey, index, val) => {
    setInputs(prev => {
      const copy = { ...prev };
      copy[stepKey][index] = val;
      return copy;
    });
  };

  const handleNext = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const currentStep = steps[activeStepIndex];

  if (completed) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full text-center space-y-4 mx-auto animate-fade-in-up">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          Grounding complete
        </span>
        <h3 className="text-base font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>You are here. You are safe.</h3>
        <p className="text-xs text-[#7C86A6] leading-relaxed mb-2">
          Bringing your attention back to your immediate environment helps calm the nervous system. How do you feel now?
        </p>
        <button
          onClick={onComplete}
          className="w-full py-2.5 rounded-full bg-[#7C86A6] hover:bg-[#68718F] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full space-y-4 mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          5-4-3-2-1 Grounding
        </span>
        <span className="text-[10px] text-[#7C86A6]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          Step {activeStepIndex + 1}/5
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#333A4D]">{currentStep.label}</p>
        <div className="space-y-2">
          {inputs[currentStep.key].map((val, idx) => (
            <input
              key={idx}
              type="text"
              value={val}
              onChange={(e) => handleInputChange(currentStep.key, idx, e.target.value)}
              placeholder={currentStep.placeholders[idx] || `Item ${idx + 1}`}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DDE1EC] focus:border-[#7C86A6] text-xs outline-none bg-[#F8F9FA] text-[#333A4D] transition-all"
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-2.5 rounded-full bg-[#7C86A6] hover:bg-[#68718F] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm mt-2"
      >
        {activeStepIndex === steps.length - 1 ? "Complete Grounding 🌸" : "Next Step →"}
      </button>
    </div>
  );
}

function ReframeWidget({ onComplete }) {
  const [anxiousThought, setAnxiousThought] = useState("");
  const [controlReframing, setControlReframing] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSubmit = () => {
    if (!anxiousThought.trim() || !controlReframing.trim()) return;
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full text-center space-y-4 mx-auto animate-fade-in-up">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          Reframe Saved
        </span>
        <h3 className="text-base font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>Cognitive Shift Registered</h3>
        <div className="text-left text-xs p-4 bg-[#F8F9FA] rounded-xl border border-[#DDE1EC] space-y-2.5 mb-2">
          <div>
            <span className="font-semibold text-[#7C86A6] block uppercase tracking-wider text-[9px]">Anxious thought:</span>
            <span className="text-[#333A4D]">{anxiousThought}</span>
          </div>
          <div className="pt-2 border-t border-[#DDE1EC]">
            <span className="font-semibold text-[#A79BC9] block uppercase tracking-wider text-[9px]">Reframe (In your control):</span>
            <span className="text-[#333A4D] font-medium">{controlReframing}</span>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="w-full py-2.5 rounded-full bg-[#7C86A6] hover:bg-[#68718F] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full space-y-4 mx-auto animate-fade-in-up">
      <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        Mindfulness Reframe
      </span>
      <h3 className="text-sm font-semibold text-[#333A4D] leading-tight">Let's reframe a catastrophizing or anxious thought together.</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-[#7C86A6] uppercase tracking-wider mb-1" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            1. WHAT IS STRESSING YOU RIGHT NOW?
          </label>
          <textarea
            value={anxiousThought}
            onChange={(e) => setAnxiousThought(e.target.value)}
            placeholder="e.g. I am going to fail this project and get fired..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE1EC] focus:border-[#7C86A6] text-xs outline-none bg-[#F8F9FA] text-[#333A4D] transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#7C86A6] uppercase tracking-wider mb-1" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            2. WHAT IS ONE SMALL THING YOU ACTUALLY CONTROL?
          </label>
          <textarea
            value={controlReframing}
            onChange={(e) => setControlReframing(e.target.value)}
            placeholder="e.g. I can outline my next 3 tasks and focus on them."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE1EC] focus:border-[#7C86A6] text-xs outline-none bg-[#F8F9FA] text-[#333A4D] transition-all resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!anxiousThought.trim() || !controlReframing.trim()}
        className={`w-full py-2.5 rounded-full text-white font-semibold text-xs transition-all shadow-sm ${
          anxiousThought.trim() && controlReframing.trim()
            ? "bg-[#7C86A6] hover:bg-[#68718F] cursor-pointer"
            : "bg-[#B8C0D3] cursor-not-allowed"
        }`}
      >
        Submit Reframe 📓
      </button>
    </div>
  );
}

function MovementWidget({ onComplete }) {
  const [seconds, setSeconds] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isActive || seconds <= 0) {
      if (seconds === 0) setCompleted(true);
      return;
    }
    const interval = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  if (completed) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full text-center space-y-4 mx-auto animate-fade-in-up">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          Movement complete
        </span>
        <h3 className="text-base font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>Thank you for moving!</h3>
        <p className="text-xs text-[#7C86A6] leading-relaxed mb-2">
          Physical shifts help reset blood flow and release muscular tension. Take a slow sip of water. How does your body feel?
        </p>
        <button
          onClick={onComplete}
          className="w-full py-2.5 rounded-full bg-[#7C86A6] hover:bg-[#68718F] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DDE1EC] shadow-sm max-w-md w-full flex flex-col items-center text-center space-y-5 mx-auto animate-fade-in-up">
      <span className="text-xs uppercase tracking-wider font-semibold text-[#A79BC9]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        Micro Movement
      </span>
      <h3 className="text-sm font-semibold text-[#333A4D] leading-tight">Let's step away for a quick physical release.</h3>
      
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className={`absolute w-20 h-20 rounded-full border-2 border-dashed border-[#A79BC9] ${isActive ? "animate-spin" : ""}`} style={{ animationDuration: '8s' }} />
        <span className="text-xl font-bold text-[#333A4D] z-10">{seconds}s</span>
      </div>

      <p className="text-xs text-[#7C86A6] leading-relaxed max-w-xs">
        Stand up, drop your shoulders, roll your neck slowly, and shake out your wrists.
      </p>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex-1 py-2 rounded-full border border-[#DDE1EC] text-xs font-semibold text-[#7C86A6] hover:bg-[#F3F4F8] transition-all cursor-pointer"
        >
          {isActive ? "Pause" : "Start 15s Timer"}
        </button>
        <button
          onClick={() => setCompleted(true)}
          className="flex-1 py-2 rounded-full bg-[#7C86A6] hover:bg-[#68718F] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
        >
          I'm Done 🏃
        </button>
      </div>
    </div>
  );
}

function ChatView({ initialMood, username, stressText, userId, stressLevel, memorySummary, buddyName, apiKeyConfigured, setApiKeyConfigured }) {
  const getInitialMessages = () => {
    let greetingText = `Hi, I'm your ${buddyName} 🐼. I'm here to support you. How has your day been going?`;
    if (initialMood === "sad") {
      greetingText = `Hi, I'm your ${buddyName} 🐼. I'm here for you today, and I want to support you. What's been weighing on your mind?`;
    } else if (initialMood === "happy") {
      greetingText = `Hi, I'm your ${buddyName} 🐼. It's great to connect with you today! What's something positive that has been going well?`;
    }
    
    return [{ from: "bot", text: greetingText }];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // Fresh start conversation
  const scrollRef = useRef(null);

  // Re-generate initial greeting if buddyName changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0 && prev[0].from === "bot" && prev[0].text.includes("Hi, I'm your")) {
        const updated = [...prev];
        let greetingText = `Hi, I'm your ${buddyName} 🐼. I'm here to support you. How has your day been going?`;
        if (initialMood === "sad") {
          greetingText = `Hi, I'm your ${buddyName} 🐼. I'm here for you today, and I want to support you. What's been weighing on your mind?`;
        } else if (initialMood === "happy") {
          greetingText = `Hi, I'm your ${buddyName} 🐼. It's great to connect with you today! What's something positive that has been going well?`;
        }
        updated[0] = { from: "bot", text: greetingText };
        return updated;
      }
      return prev;
    });
  }, [buddyName, initialMood]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          user_id: userId,
          username: username,
          message: userMsg,
          stress_level: stressLevel,
          mood: initialMood
        })
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
      if (data.api_key_configured !== undefined) {
        setApiKeyConfigured(data.api_key_configured);
      }
      if (data.tool_id !== "none") {
        setActiveTool(data.tool_id);
      } else {
        setActiveTool(null);
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { from: "bot", text: "I'm having trouble connecting to my brain right now, but I'm still here for you. 🌸" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToolComplete = (toolId) => {
    setActiveTool(null);
    let completeText = "";
    if (toolId === "box_breathing") {
      completeText = "I've completed the box breathing exercise. I feel a bit more centered.";
    } else if (toolId === "grounding_54321") {
      completeText = "I finished the 5-4-3-2-1 grounding exercise. It helped pull me back to the present.";
    } else if (toolId === "reframe_prompt") {
      completeText = "I completed the cognitive reframe. It helped clarify what I can control.";
    } else if (toolId === "micro_movement") {
      completeText = "I finished the micro-movement stretch. Shifting my physical state felt good.";
    }
    
    if (completeText) {
      // Append user msg to UI
      setMessages((m) => [...m, { from: "user", text: completeText }]);
      setIsTyping(true);
      
      // Fetch response
      fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          user_id: userId,
          username: username,
          message: completeText,
          stress_level: stressLevel,
          mood: initialMood
        })
      })
      .then(res => res.json())
      .then(data => {
        setMessages((m) => [...m, { from: "bot", text: data.reply }]);
        if (data.api_key_configured !== undefined) {
          setApiKeyConfigured(data.api_key_configured);
        }
        if (data.tool_id !== "none") {
          setActiveTool(data.tool_id);
        }
      })
      .catch(e => {
        console.error(e);
        setMessages((m) => [...m, { from: "bot", text: `Glad you completed that, ${username}! How are you feeling now?` }]);
      })
      .finally(() => {
        setIsTyping(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#DDE1EC] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#DDE1EC]">
            🐼
          </div>
          <div>
            <h2 className="text-base font-medium text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>{buddyName}</h2>
            <p className="text-xs text-[#7C86A6]">Here whenever you need to talk</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full border border-[#DDE1EC] text-[#7C86A6]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            Stress: {stressText}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#DDE1EC] text-[#4F5A78] font-medium">
            <Lock size={12} />
            Private Check-in
          </div>
        </div>
      </div>

      {/* Chat scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 bg-[#EAEDF3]">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* API Key Not Configured Alert */}
          {!apiKeyConfigured && (
            <div className="bg-[#FFF3CD] border border-[#FFEBAA] rounded-xl px-4 py-3 text-xs text-[#856404] flex items-center justify-between shadow-sm animate-fade-in-up">
              <span>⚠️ <b>Offline Fallback Mode:</b> The backend <code>OPENAI_API_KEY</code> is not configured or is a placeholder in <code>.env</code>. The companion is currently running local heuristic responses. Please add your key to `.env` in the project root to unlock the full LLM dialogue.</span>
            </div>
          )}

          {/* Renaming Hint */}
          <div className="bg-[#DDE1EC] rounded-xl px-4 py-2.5 text-xs text-[#4F5A78] flex items-center justify-between">
            <span>💡 <b>Tip:</b> Want to change my name? Click and edit my name directly in the sidebar!</span>
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                  m.from === "user" ? "rounded-2xl rounded-tr-sm shadow-sm" : "rounded-2xl rounded-tl-sm border shadow-sm"
                }`}
                style={
                  m.from === "user"
                    ? { background: "#7C86A6", color: "#FFFFFF" }
                    : { background: "#FFFFFF", color: "#333A4D", borderColor: "#DDE1EC" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm border border-[#DDE1EC] shadow-sm px-4 py-2.5 text-sm text-[#7C86A6] italic animate-pulse">
                🐼 {buddyName} is typing...
              </div>
            </div>
          )}

          {/* Interactive Supporting Visual Widgets for Calming Techniques */}
          {activeTool === "box_breathing" && <BreathingWidget onComplete={() => handleToolComplete("box_breathing")} />}
          {activeTool === "grounding_54321" && <GroundingWidget onComplete={() => handleToolComplete("grounding_54321")} />}
          {activeTool === "reframe_prompt" && <ReframeWidget onComplete={() => handleToolComplete("reframe_prompt")} />}
          {activeTool === "micro_movement" && <MovementWidget onComplete={() => handleToolComplete("micro_movement")} />}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-5 border-t border-[#DDE1EC] bg-white">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            value={input}
            disabled={isTyping}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isTyping ? `${buddyName} is typing...` : "Tell me what's on your mind..."}
            className="flex-1 px-5 py-3 rounded-full text-sm outline-none border border-[#DDE1EC] focus:border-[#7C86A6] transition-all bg-[#F8F9FA] text-[#333A4D]"
          />
          <button onClick={send} disabled={isTyping} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-[#7C86A6] hover:bg-[#68718F] active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50">
            <Send size={16} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}

function JournalView({ userId, entries, setEntries, mood, setMood }) {
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [encouragementEmoji, setEncouragementEmoji] = useState("🌱");

  const save = async () => {
    if (!draft.trim()) return;
    setIsSaving(true);
    try {
      // 1. Log journal entry
      await fetch("http://localhost:5000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ user_id: userId, entry: draft })
      });

      // 2. Log mood to SQLite if mood is set
      if (mood) {
        await fetch("http://localhost:5000/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ user_id: userId, mood: mood })
        });
      }

      // 3. Show encouraging quote and shuffle emoji
      const messages = [
        "Thank you for sharing your thoughts. Acknowledging how you feel is a powerful step in taking care of your mind. 🌟",
        "Writing things down helps declutter the mind. You are doing a wonderful job checking in with yourself. 🌱",
        "Your reflection has been securely logged. Be proud of taking this time for yourself today. 🌸",
        "Letting it out on paper is a great way to release tension. I'm here to support you. 💖"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setEncouragement(randomMsg);

      const calmingEmojis = ["🌱", "🌸", "✨", "☀️", "🦋", "🍃", "🌈", "🌊", "🕯️", "🌻", "🍀", "💫", "🐳", "🧸"];
      const randomEmoji = calmingEmojis[Math.floor(Math.random() * calmingEmojis.length)];
      setEncouragementEmoji(randomEmoji);

      // reload entries
      const res = await fetch(`http://localhost:5000/api/journal?user_id=${userId}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
      setDraft("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!confirm("Are you sure you want to delete this reflection log?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/journal?entry_id=${entryId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
      if (res.ok) {
        // reload entries
        const fetchRes = await fetch(`http://localhost:5000/api/journal?user_id=${userId}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setEntries(data);
        }
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 bg-gradient-to-br from-[#EAEDF3] via-[#F1F3F8] to-[#E5E9F3] scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Title Block */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDE1EC]">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <BookHeart size={22} className="text-[#A79BC9]" />
              <h2 className="text-2xl font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>Reflection Journal</h2>
            </div>
            <p className="text-xs text-[#7C86A6]">Private notes and mood logs, just for you.</p>
          </div>
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-[#DDE1EC] items-center justify-center text-sm shadow-sm select-none">
            ✨
          </div>
        </div>

        {encouragement && (
          <div className="fixed inset-0 bg-[#333A4D]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full border border-[#DDE1EC] shadow-[0_20px_50px_rgba(51,58,77,0.15)] text-center space-y-6 relative overflow-hidden animate-bounce-in">
              {/* Rotating background light pattern in lavender */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-tr from-[#A79BC9]/15 to-[#7C86A6]/15 animate-glow-rotate pointer-events-none" />
              
              {/* Soft icon wrapper using Lavender and Dusty Blue */}
              <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#A79BC9] to-[#7C86A6] flex items-center justify-center shadow-lg">
                <span className="text-3xl">{encouragementEmoji}</span>
              </div>

              {/* Just the encouraging message */}
              <p className="text-base text-[#333A4D] font-medium leading-relaxed max-w-xs mx-auto z-10 relative" style={{ fontFamily: "Fraunces, serif" }}>
                {encouragement}
              </p>

              {/* Close Action pill */}
              <button 
                onClick={() => setEncouragement("")}
                className="w-full py-3.5 rounded-full bg-[#7C86A6] hover:bg-[#68718F] active:scale-[0.97] transition-all text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md z-10 relative hover:shadow-[0_8px_20px_rgba(124,134,166,0.3)]"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Input Card Container */}
        <div className="bg-white rounded-3xl p-6 border border-[#DDE1EC] shadow-sm hover:shadow-[0_8px_30px_rgba(124,134,166,0.08)] transition-all duration-300 space-y-5">
          {/* Mood Section on Journal Page */}
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-2.5 text-[#7C86A6] uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              HOW ARE YOU FEELING RIGHT NOW?
            </p>
            <div className="flex gap-3">
              {moods.map((m) => {
                const isActive = mood === m.key;
                let activeStyle = {};
                if (isActive) {
                  if (m.key === "sad") activeStyle = { background: "#FDF2F2", borderColor: "#EC5B5B", color: "#C92A2A" };
                  else if (m.key === "happy") activeStyle = { background: "#F3FAF5", borderColor: "#4BCA81", color: "#2B8A50" };
                  else activeStyle = { background: "#F0F3FA", borderColor: "#7C86A6", color: "#4F5A78" };
                }
                return (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] duration-200"
                    style={isActive ? activeStyle : { background: "#FFFFFF", borderColor: "#DDE1EC", color: "#7C86A6" }}
                  >
                    <span className="text-base">{m.glyph}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-widest mb-2.5 text-[#7C86A6] uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              WRITE A REFLECTION
            </p>
            <textarea
              value={draft}
              disabled={isSaving}
              onChange={(e) => {
                setDraft(e.target.value);
                if (encouragement) setEncouragement("");
              }}
              placeholder="What's on your mind today? Writing it down helps process it..."
              rows={4}
              className="w-full text-sm outline-none resize-none bg-[#F8F9FA] p-4.5 rounded-2xl border border-[#DDE1EC] focus:border-[#A79BC9] focus:bg-white focus:ring-4 focus:ring-[#A79BC9]/10 text-[#333A4D] transition-all duration-300 placeholder-[#9AA3BC]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={save}
              disabled={isSaving || !draft.trim()}
              className={`flex items-center gap-1.5 px-6 py-3 rounded-full text-xs font-semibold text-white transition-all shadow-sm duration-200 active:scale-95 ${
                draft.trim() && !isSaving 
                  ? "bg-[#7C86A6] hover:bg-[#68718F] cursor-pointer" 
                  : "bg-[#B8C0D3] cursor-not-allowed"
              }`}
            >
              <Plus size={14} /> {isSaving ? "Saving..." : "Save entry"}
            </button>
          </div>
        </div>

        {/* Entries List Header */}
        {entries.length > 0 && (
          <p className="text-[10px] font-bold tracking-widest text-[#7C86A6] uppercase pt-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            PAST ENTRIES ({entries.length})
          </p>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((e, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl p-5 border border-[#DDE1EC] shadow-sm hover:shadow-[0_6px_20px_rgba(124,134,166,0.06)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              style={{ borderLeft: "4px solid #A79BC9" }}
            >
              {/* Delete Button on Hover */}
              <button
                onClick={() => deleteEntry(e.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-[#7C86A6] hover:text-[#B5493B] hover:bg-[#FDF2F2] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer font-bold select-none z-20"
                title="Delete reflection"
              >
                ×
              </button>

              <div className="flex justify-between items-start mb-2.5 pr-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C86A6] bg-[#DDE1EC]/50 px-2.5 py-0.5 rounded-md" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                  Reflection
                </span>
                <p className="text-[10px] text-[#7C86A6] font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                  {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <p className="text-sm text-[#333A4D] leading-relaxed whitespace-pre-wrap font-medium">{e.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function ResourcesView() {
  const [resourceData, setResourceData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/resources")
      .then(res => res.json())
      .then(data => setResourceData(data))
      .catch(err => console.error("Error loading resources", err));
  }, []);

  return (
    <div className="h-full overflow-y-auto px-8 py-8 bg-gradient-to-br from-[#EAEDF3] via-[#F1F3F8] to-[#E5E9F3] scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Support Header Card */}
        <div className="bg-gradient-to-br from-[#A79BC9] to-[#7C86A6] text-white rounded-[32px] p-8 shadow-md border border-[#DDE1EC]/20 relative overflow-hidden">
          {/* Decorative aura */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>
              You are not alone. 🤍
            </h2>
            <p className="text-sm font-medium opacity-90 max-w-2xl leading-relaxed">
              Someone can only help you if you ask for help. Please don't hesitate to reach out to these free, confidential support lines whenever you need support.
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 gap-5">
          {resourceData.map((res, i) => (
            <div 
              key={i} 
              className="bg-white rounded-3xl p-6 border border-[#DDE1EC] shadow-sm hover:shadow-[0_8px_30px_rgba(124,134,166,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group"
              style={{ borderLeft: "5px solid #A79BC9" }}
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {res.tags.map((t, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#F0F3FA] text-[#7C86A6]" 
                      style={{ fontFamily: "IBM Plex Mono, monospace" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>{res.name}</h3>
                <p className="text-xs text-[#7C86A6] leading-relaxed max-w-2xl">{res.desc}</p>
              </div>

              {/* Number Container - Highly Visible & Bold */}
              <div className="w-full md:w-auto shrink-0 bg-[#F0F3FA] border border-[#DDE1EC] rounded-2xl p-4 text-center md:text-right flex flex-col gap-1 shadow-sm hover:bg-[#E8EBF2] transition-colors duration-200">
                <span className="text-[9px] text-[#7C86A6] font-bold tracking-widest uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                  HELPLINE NUMBER
                </span>
                <span className="text-sm md:text-base font-bold text-[#333A4D] select-all cursor-pointer" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                  {res.contact}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* NIMHANS footer info card */}
        <div className="rounded-3xl p-6 bg-white border border-[#DDE1EC] shadow-sm" style={{ borderLeft: "5px solid #7C86A6" }}>
          <h4 className="text-sm font-bold text-[#333A4D] mb-2" style={{ fontFamily: "Fraunces, serif" }}>Government Initiatives & NIMHANS</h4>
          <p className="text-xs text-[#7C86A6] leading-relaxed">
            The National Institute of Mental Health and Neurosciences (NIMHANS) in Bengaluru is the apex center for mental health and neuroscience education. The Government of India launched **Tele-MANAS** as a massive extension to reach rural and remote communities, bridging the healthcare gap. If you or someone you know is in severe distress, Tele-MANAS is highly recommended for immediate medical and therapeutic triage.
          </p>
        </div>

      </div>
    </div>
  );
}

function ManagerView() {
  const [insight, setInsight] = useState("Click the button below to generate weekly anonymized insights.");
  const [isLoading, setIsLoading] = useState(false);
  const [avgMood, setAvgMood] = useState(5.9);
  const [delta, setDelta] = useState(14);
  const [engagementRate, setEngagementRate] = useState("67%");
  const [checkinsCount, setCheckinsCount] = useState(34);
  const [moodTrend, setMoodTrend] = useState([
    { day: "Mon", score: 6.8 },
    { day: "Tue", score: 6.2 },
    { day: "Wed", score: 5.5 },
    { day: "Thu", score: 5.1 },
    { day: "Fri", score: 5.9 },
  ]);
  const [dashboardThemes, setDashboardThemes] = useState([
    { label: "Deadline pressure", pct: 62 },
    { label: "Meeting overload", pct: 44 },
    { label: "Unclear priorities", pct: 31 },
  ]);

  useEffect(() => {
    fetch("http://localhost:5000/api/manager/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.avg_this_week !== undefined) setAvgMood(data.avg_this_week);
        if (data.delta !== undefined) setDelta(data.delta);
        if (data.engagement_rate !== undefined) setEngagementRate(`${data.engagement_rate}%`);
        if (data.total_checkins !== undefined) setCheckinsCount(data.total_checkins);
        if (data.mood_trend !== undefined) setMoodTrend(data.mood_trend);
        if (data.themes !== undefined) setDashboardThemes(data.themes);
      })
      .catch(err => console.error("Error loading dashboard metrics", err));
  }, []);

  const getInsight = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/manager/insight");
      const data = await res.json();
      setInsight(data.insight);
    } catch (e) {
      console.error(e);
      setInsight("Unable to connect to Gemini backend. Check if the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 bg-gradient-to-br from-[#EAEDF3] via-[#F1F3F8] to-[#E5E9F3] scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title Block */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDE1EC]">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Users size={22} className="text-[#A79BC9]" />
              <h2 className="text-2xl font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>Team Wellbeing Overview</h2>
            </div>
            <p className="text-xs text-[#7C86A6]">Aggregated across team members. No individual data is ever shown.</p>
          </div>
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-[#DDE1EC] items-center justify-center text-sm shadow-sm select-none">
            📊
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-[#DDE1EC] shadow-sm">
            <p className="text-[9px] text-[#7C86A6] font-bold tracking-widest mb-2 uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>AVG MOOD SCORE</p>
            <div className="flex items-end gap-2.5">
              <span className="text-3xl font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>{avgMood}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold mb-1" style={{ color: delta >= 0 ? "#B5493B" : "#2B8A50" }}>
                {delta >= 0 ? <TrendingDown size={12} /> : "↑"} {Math.abs(delta)}%
              </span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#DDE1EC] shadow-sm">
            <p className="text-[9px] text-[#7C86A6] font-bold tracking-widest mb-2 uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>ENGAGEMENT</p>
            <span className="text-3xl font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>{engagementRate}</span>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#DDE1EC] shadow-sm">
            <p className="text-[9px] text-[#7C86A6] font-bold tracking-widest mb-2 uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>CHECK-INS LOGGED</p>
            <span className="text-3xl font-semibold text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>{checkinsCount}</span>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[#DDE1EC] shadow-sm">
          <p className="text-[9px] text-[#7C86A6] font-bold tracking-widest mb-4 uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>MOOD TREND</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={moodTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9AA3BC" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #DDE1EC", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#A79BC9" strokeWidth={3} dot={{ r: 4, fill: "#A79BC9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Themes */}
        <div className="bg-white rounded-3xl p-6 border border-[#DDE1EC] shadow-sm">
          <p className="text-[9px] text-[#7C86A6] font-bold tracking-widest mb-4 uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>TOP THEMES THIS WEEK</p>
          <div className="space-y-4">
            {dashboardThemes.map((t) => (
              <div key={t.label}>
                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: "#333A4D" }}>
                  <span>{t.label}</span>
                  <span style={{ color: "#7C86A6" }}>{t.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#DDE1EC]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#A79BC9] to-[#7C86A6] transition-all duration-500" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Action */}
        <div className="rounded-3xl p-6 flex flex-col gap-4 shadow-sm bg-gradient-to-br from-[#DDE1EC] to-[#CFD4E6] border border-[#C9CEDF]">
          <div className="flex items-start gap-4">
            <Sparkles size={20} color="#7C86A6" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1 text-[#333A4D]">Anonymized Weekly Summary</p>
              <p className="text-xs leading-relaxed text-[#4F5A78]">
                {insight}
              </p>
            </div>
          </div>
          <button 
            onClick={getInsight}
            disabled={isLoading}
            className="self-start px-5 py-2.5 rounded-full bg-white border border-[#DDE1EC] text-xs font-semibold text-[#7C86A6] hover:bg-[#F3F4F8] transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Generate AI Weekly Summary"}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6 text-[10px] text-[#9AA3BC] font-bold justify-center uppercase tracking-wider" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
          <ShieldCheck size={14} />
          Individual conversations are never visible here — only team-level, anonymized trends.
        </div>
      </div>
    </div>
  );
}

export default function App() {
const [step, setStep] = useState("login"); // login -> motivation -> checkin -> dashboard
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [userId, setUserId] = useState(null);
  const [memorySummary, setMemorySummary] = useState("None");
  const [study, setStudy] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [screen, setScreen] = useState(5);
  const [exercise, setExercise] = useState(1);
  const [mood, setMood] = useState(null);
  const [view, setView] = useState("chat");
  const [buddyName, setBuddyName] = useState("Panda Buddy");
  const [journalEntries, setJournalEntries] = useState([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);

  const tabs = [
    { key: "chat", label: "Chat Support", icon: MessageCircle },
    { key: "journal", label: "Reflection Journal", icon: BookHeart },
    { key: "resources", label: "Support Resources", icon: ShieldCheck },
    { key: "manager", label: "Team Wellbeing", icon: Users },
  ];

  // Logical Stress Calculation:
  // Baseline = 5. Sleep offsets stress if 7-9 hours, else sleep lack increases it. 
  // Screen and Study hours raise stress. Exercise hours significantly lower stress.
  const sleepDiff = sleep < 7 ? (7 - sleep) * 0.5 : -(sleep - 7) * 0.2;
  const score = (study * 0.2) + (screen * 0.3) + sleepDiff - (exercise * 0.4);
  
  let stressText = "Low 🌿";
  let stressLevel = 0;
  let stressColor = "#4CAF50";
  if (score > 1.2 && score <= 3.2) {
    stressText = "Medium 🌼";
    stressLevel = 1;
    stressColor = "#FF9800";
  } else if (score > 3.2) {
    stressText = "High 🌧️";
    stressLevel = 2;
    stressColor = "#F44336";
  }

  const handleAuth = async () => {
    if (!username.trim() || !password) return;
    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUserId(data.user.id);
        setMemorySummary(data.user.memory_summary);
        if (data.user.api_key_configured !== undefined) {
          setApiKeyConfigured(data.user.api_key_configured);
        }
        setStep("motivation");
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (e) {
      console.error("Auth failed", e);
      alert("Authentication failed. Please make sure the backend is running.");
    }
  };

  const handleCheckin = async () => {
    try {
      if (userId) {
        await fetch("http://localhost:5000/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({
            user_id: userId,
            study: study,
            sleep: sleep,
            screen: screen,
            exercise: exercise,
            stress_level: stressLevel
          })
        });

        const res = await fetch(`http://localhost:5000/api/journal?user_id=${userId}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
        if (res.ok) {
          const data = await res.json();
          setJournalEntries(data);
        }
      }
    } catch (e) {
      console.error("Checkin logging failed", e);
    }
    setStep("dashboard");
  };

  const handleEndSession = async () => {
    if (!userId) return;
    try {
      const res = await fetch("http://localhost:5000/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(`Session ended! Memory summary generated and stored securely in SQLite database: \n\n"${data.summary}"`);
        setMemorySummary(data.summary);
      } else {
        alert("No chat history found to summarize yet.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to summarize session.");
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.api_key_configured !== undefined) {
          setApiKeyConfigured(data.api_key_configured);
        }
      })
      .catch(err => console.error("Failed to check config", err));
  }, []);

  // Capitalize name safely
  const displayName = username ? username.charAt(0).toUpperCase() + username.slice(1) : "";

  if (step === "login") {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#EAEDF3]" style={{ fontFamily: "Work Sans, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div className="bg-white rounded-3xl border border-[#DDE1EC] shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-medium mb-2 text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>
            {isRegistering ? "Create an Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-[#7C86A6] mb-6">Secure your wellness journey.</p>
          <div className="mb-4 text-left">
            <label className="block text-xs font-semibold tracking-wider text-[#7C86A6] mb-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alice123"
              className="w-full px-4 py-3 rounded-xl border border-[#DDE1EC] outline-none focus:border-[#7C86A6] text-[#333A4D] transition-all bg-[#F8F9FA]"
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block text-xs font-semibold tracking-wider text-[#7C86A6] mb-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#DDE1EC] outline-none focus:border-[#7C86A6] text-[#333A4D] transition-all bg-[#F8F9FA]"
            />
          </div>
          <div className="mb-6 text-left">
            <label className="block text-xs font-semibold tracking-wider text-[#7C86A6] mb-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              WELLNESS BUDDY NAME
            </label>
            <input
              type="text"
              value={buddyName}
              onChange={(e) => setBuddyName(e.target.value)}
              placeholder="e.g. Panda Buddy"
              className="w-full px-4 py-3 rounded-xl border border-[#DDE1EC] outline-none focus:border-[#7C86A6] text-[#333A4D] transition-all bg-[#F8F9FA]"
            />
          </div>
          <button
            onClick={handleAuth}
            className="w-full py-3 rounded-full bg-[#7C86A6] text-white font-medium hover:bg-[#68718F] transition-all cursor-pointer shadow-sm active:scale-98 mb-4"
          >
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
          <p className="text-sm text-[#7C86A6]">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <span 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="text-[#333A4D] font-medium cursor-pointer hover:underline"
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (step === "motivation") {
    return (
      <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EAEDF3] via-[#E2E6EF] to-[#D4D9E6]" style={{ fontFamily: "Work Sans, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            opacity: 0;
            animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-150 { animation-delay: 150ms; }
          .delay-450 { animation-delay: 450ms; }
          .delay-750 { animation-delay: 750ms; }
          
          @keyframes gentleBreathe {
            0%, 100% { transform: scale(0.85); opacity: 0.15; filter: blur(40px); }
            50% { transform: scale(1.15); opacity: 0.35; filter: blur(56px); }
          }
          .bg-breathe-blob {
            animation: gentleBreathe 10s ease-in-out infinite;
          }
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 0.9;
              transform: scale(1.1);
            }
            80% {
              transform: scale(0.89);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-bounce-in {
            animation: bounceIn 0.85s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
          }
          @keyframes glowRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-glow-rotate {
            animation: glowRotate 8s linear infinite;
          }
        `}</style>

        {/* Back Button */}
        <button 
          onClick={() => setStep("login")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#7C86A6] hover:text-[#333A4D] transition-all cursor-pointer z-10"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          ← BACK
        </button>

        {/* Breathing ambient background blob */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#A79BC9] to-[#7C86A6] bg-breathe-blob pointer-events-none" />

        {/* Motivation Card Content */}
        <div className="z-10 max-w-2xl w-full text-center px-6 flex flex-col items-center">
          
          {/* Subtle line-art spinning breathing motif */}
          <div className="w-16 h-16 rounded-full border-2 border-[#7C86A6]/40 flex items-center justify-center mb-10 animate-fade-in-up shadow-sm bg-white/20 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full border border-dashed border-[#7C86A6] animate-spin" style={{ animationDuration: '60s' }} />
          </div>

          {/* Context Name Label */}
          <span 
            className="text-xl md:text-2xl font-semibold tracking-normal text-[#333A4D] mb-3.5 animate-fade-in-up delay-150 block" 
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Hello, {displayName}
          </span>

          {/* Main payoff headline */}
          <h2 
            className="text-4xl md:text-5xl font-medium text-[#333A4D] tracking-tight leading-tight mb-6 animate-fade-in-up delay-150" 
            style={{ fontFamily: "Fraunces, serif" }}
          >
            You are stronger than you think.
          </h2>

          {/* Muted supporting text */}
          <p className="text-[#7C86A6] text-sm md:text-base leading-relaxed max-w-lg mb-10 animate-fade-in-up delay-450">
            Every day you show up, you grow a little more.<br />
            Take a deep breath. This is your safe space.
          </p>

          {/* Button with presence */}
          <button
            onClick={() => setStep("checkin")}
            className="animate-fade-in-up delay-750 flex items-center justify-center gap-2 px-10 py-4.5 rounded-full bg-[#5C6688] text-white font-medium hover:bg-[#4E5676] hover:shadow-[0_8px_30px_rgba(92,102,136,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-sm tracking-wide"
          >
            Enter My Wellness Space
            <Sparkles size={16} className="ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (step === "checkin") {
    return (
      <div className="w-full h-screen overflow-y-auto relative flex items-center justify-center bg-[#EAEDF3] py-8" style={{ fontFamily: "Work Sans, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        
        {/* Back Button */}
        <button 
          onClick={() => setStep("motivation")} 
          className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#7C86A6] hover:text-[#333A4D] transition-all cursor-pointer z-10"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          ← BACK
        </button>

        <div className="bg-white rounded-3xl border border-[#DDE1EC] shadow-sm p-8 max-w-xl w-full space-y-6 z-0">
          <div className="text-center">
            <h2 className="text-xl font-medium text-[#333A4D]" style={{ fontFamily: "Fraunces, serif" }}>Daily Wellness Check</h2>
            <p className="text-xs text-[#7C86A6] mt-1">Let's log your habits to gauge your stress levels</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7C86A6] mb-1.5" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                <span>STUDY HOURS</span>
                <span>{study}h</span>
              </div>
              <input type="range" min="0" max="24" value={study} onChange={(e) => setStudy(Number(e.target.value))} className="w-full accent-[#7C86A6]" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7C86A6] mb-1.5" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                <span>SLEEP HOURS</span>
                <span>{sleep}h</span>
              </div>
              <input type="range" min="0" max="24" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-full accent-[#7C86A6]" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7C86A6] mb-1.5" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                <span>SCREEN TIME</span>
                <span>{screen}h</span>
              </div>
              <input type="range" min="0" max="24" value={screen} onChange={(e) => setScreen(Number(e.target.value))} className="w-full accent-[#7C86A6]" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7C86A6] mb-1.5" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                <span>EXERCISE HOURS</span>
                <span>{exercise}h</span>
              </div>
              <input type="range" min="0" max="24" value={exercise} onChange={(e) => setExercise(Number(e.target.value))} className="w-full accent-[#7C86A6]" />
            </div>
          </div>

          <div className="bg-[#F3F4F8] p-4 rounded-xl text-center border border-[#DDE1EC]">
            <span className="text-xs font-semibold text-[#7C86A6] block mb-1" style={{ fontFamily: "IBM Plex Mono, monospace" }}>CALCULATED STRESS LEVEL</span>
            <span className="text-lg font-medium" style={{ color: stressColor }}>{stressText}</span>
          </div>

          <button
            onClick={handleCheckin}
            className="w-full py-3 rounded-full text-white font-medium transition-all shadow-sm active:scale-98 bg-[#7C86A6] hover:bg-[#68718F] cursor-pointer"
          >
            Connect to {buddyName}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-[#EAEDF3] text-[#333A4D]" style={{ fontFamily: "Work Sans, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div className="w-64 h-full bg-white border-r border-[#DDE1EC] flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Back to Wellness Check button */}
          <button 
            onClick={() => setStep("checkin")} 
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#7C86A6] hover:text-[#333A4D] transition-all cursor-pointer mb-5"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            ← BACK TO HABITS
          </button>

          {/* Logo / Header with Rename Input */}
          <div className="flex items-center gap-3 mb-10 mt-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#DDE1EC]">
              🐼
            </div>
            <div className="group relative">
              <input
                type="text"
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                placeholder="Panda Buddy"
                className="text-base font-semibold tracking-tight outline-none border-b border-transparent hover:border-gray-200 focus:border-[#7C86A6] text-[#333A4D] w-36 bg-transparent transition-all"
                style={{ fontFamily: "Fraunces, serif" }}
              />
              <p className="text-[9px] text-[#7C86A6] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 left-0">Rename Companion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = view === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setView(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-l-[3px] ${
                    isActive 
                      ? "bg-[#F3F4F8] text-[#333A4D] border-[#7C86A6] font-semibold" 
                      : "text-[#7C86A6] border-transparent hover:bg-[#F9FAFB] hover:text-[#333A4D]"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-[#DDE1EC] pt-4 space-y-3">
          <button 
            onClick={handleEndSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-[#DDE1EC] text-[#7C86A6] hover:bg-[#F3F4F8] hover:text-[#333A4D] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            End Session & Save Memory
          </button>
          
          <div className="flex items-center gap-2 text-xs text-[#7C86A6]">
            <Lock size={12} />
            <span>Encrypted & Private Chat</span>
          </div>
          <div className="text-[10px] text-[#7C86A6] uppercase tracking-wider flex items-center justify-between" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            <span>LOGGED IN AS: {username}</span>
            <button 
              onClick={() => {
                setStep("login");
                setUsername("");
                setUserId(null);
                setMood(null);
              }} 
              className="text-[#B5493B] hover:underline cursor-pointer font-semibold ml-2 text-[9px]"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {view === "chat" && (
          <ChatView 
            initialMood={mood} 
            username={username} 
            stressText={stressText} 
            userId={userId} 
            stressLevel={stressLevel}
            memorySummary={memorySummary}
            buddyName={buddyName}
            apiKeyConfigured={apiKeyConfigured}
            setApiKeyConfigured={setApiKeyConfigured}
          />
        )}
        {view === "journal" && (
          <JournalView 
            userId={userId} 
            entries={journalEntries} 
            setEntries={setJournalEntries} 
            mood={mood} 
            setMood={setMood} 
          />
        )}
        {view === "resources" && <ResourcesView />}
        {view === "manager" && <ManagerView />}
      </div>
    </div>
  );
}
