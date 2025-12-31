import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// === COMPONENT: Looping Typewriter ===
const TypewriterLoop = ({ text, speed = 150, pause = 2000 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      setDisplayedText((prev) => {
        if (!isDeleting) {
          if (prev.length < text.length) return text.slice(0, prev.length + 1);
          setIsDeleting(true);
          return prev;
        } else {
          if (prev.length > 0) return text.slice(0, prev.length - 1);
          setIsDeleting(false);
          return "";
        }
      });
    };
    let timer;
    if (!isDeleting && displayedText === text) {
      timer = setTimeout(handleTyping, pause);
    } else if (isDeleting && displayedText === "") {
      timer = setTimeout(handleTyping, 500);
    } else {
      timer = setTimeout(handleTyping, isDeleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, speed, pause]);

  return (
    <span className="inline-block min-h-[1.5em] text-rose-500 font-bold drop-shadow-sm">
      {displayedText}
      <span className="animate-pulse text-rose-300">|</span>
    </span>
  );
};

// === COMPONENT: Background Petals ===
const PetalSVG = ({ className }) => (
  <svg viewBox="0 0 30 30" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C15 0 18.5 5 22 9C25.5 13 28 18 28 22C28 26 25 29 21 29C17 29 15 26 15 26C15 26 13 29 9 29C5 29 2 26 2 22C2 18 4.5 13 8 9C11.5 5 15 0 15 0Z" />
  </svg>
);

const PetalBackground = () => {
  const petals = [...Array(30)].map((_, i) => ({
    id: i,
    startX: Math.random() * 100,
    swayX: Math.random() * 40 - 20, 
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 15,
    scale: Math.random() * 0.4 + 0.6,
    rotationDir: Math.random() > 0.5 ? 1 : -1
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ y: "-10vh", x: `${petal.startX}vw`, opacity: 0 }}
          animate={{
            y: "110vh", 
            x: [`${petal.startX}vw`, `${petal.startX + petal.swayX}vw`, `${petal.startX}vw`],
            opacity: [0, 0.8, 0.8, 0], 
            rotate: petal.rotationDir * (Math.random() * 360 + 360)
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "linear", 
          }}
          className="absolute top-0 left-0"
          style={{ scale: petal.scale }}
        >
          <PetalSVG className="w-8 h-8 md:w-10 md:h-10 text-rose-500/40 drop-shadow-sm filter blur-[0.5px]" />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-0"></div>
    </div>
  );
};

// === MAIN APP ===
const App = () => {
  const [name, setName] = useState("");
  const [step, setStep] = useState(0); 
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [isExploding, setIsExploding] = useState(false); 
  
  // Audio Refs (Make sure files are in /public folder)
  const audioBg = useRef(new Audio("/bg-music.mp3"));
  const audioWrong = useRef(new Audio("/wrong.mp3"));
  const audioSong = useRef(new Audio("/its-you.mp3"));

  const fullText = "Hello user, what's your name?";
  const VALID_NAMES = ["krisu", "krisu basnet"];

  const startBgMusic = () => {
    if (audioBg.current.paused) {
      audioBg.current.volume = 0.3; 
      audioBg.current.loop = true;
      audioBg.current.play().catch(e => console.log("Audio waiting for interaction"));
    }
  };

  useEffect(() => {
    if (step === 0) {
      let index = 0;
      const interval = setInterval(() => {
        setPlaceholder(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) clearInterval(interval);
      }, 80); 
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNext();
  };

  const handleNext = () => {
    const cleanName = name.trim().toLowerCase();
    if (VALID_NAMES.includes(cleanName)) {
      setError(false);
      setStep(1); 
      setTimeout(() => setStep(2), 2500); 
    } else {
      setError(true);
      setName("");
      audioWrong.current.volume = 0.5;
      audioWrong.current.play();
      if (navigator.vibrate) navigator.vibrate(300);
    }
  };

  const handleGiftClick = () => {
    if (isExploding) return; 
    setIsExploding(true); 
    
    // Switch Audio
    audioBg.current.pause();
    audioSong.current.volume = 1.0;
    audioSong.current.play();

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });

    setTimeout(() => {
      setStep(3);
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 }, colors: ['#FFC0CB', '#FF69B4', '#DC143C'] });
    }, 4000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-pink-50 to-white flex items-center justify-center p-4 font-['Nunito']">
      
      <PetalBackground />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: INPUT */}
        {step === 0 && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="w-full flex flex-col items-center z-10"
          >
            <h1 className="text-4xl sm:text-5xl text-rose-500 font-['Great_Vibes'] mb-12 drop-shadow-sm h-16 text-center">
              {placeholder}
              <span className="w-1 h-8 bg-rose-400 inline-block ml-1 animate-pulse align-middle rounded-full"/>
            </h1>
            
            <div className="relative group w-full max-w-[420px]">
              <motion.div
                animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                className={`
                  relative flex items-center p-2 rounded-full transition-all duration-500
                  ${error 
                    ? 'bg-red-50 border-2 border-red-300 shadow-[0_0_20px_rgba(248,113,113,0.3)]' 
                    : 'bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_10px_40px_rgba(244,63,94,0.2)] focus-within:shadow-[0_0_30px_rgba(236,72,153,0.4)]'
                  }
                `}
              >
                <span className="pl-4 text-2xl animate-pulse">🌹</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    startBgMusic(); 
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Your Name..."
                  className="flex-grow bg-transparent outline-none text-xl text-rose-600 placeholder-rose-300 font-bold px-4 min-w-0"
                  autoFocus
                />
                <button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-pink-400/50 transition-all active:scale-95 whitespace-nowrap"
                >
                  Open Surprise ✨
                </button>
              </motion.div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="absolute -bottom-10 left-0 right-0 text-center text-red-500 font-bold text-sm"
                >
                  Wrong name! Try again 🥺
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 1: MESSAGE */}
        {step === 1 && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center z-10 relative"
          >
            <h1 className="text-7xl text-rose-500 font-['Great_Vibes'] drop-shadow-md mb-2">
              Hey Pretty...
            </h1>
            <p className="text-rose-800 text-2xl font-['Great_Vibes']">
              This is for you 💖
            </p>
          </motion.div>
        )}

        {/* STEP 2: GIFT */}
        {step === 2 && (
          <motion.div
            key="gift"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center cursor-pointer relative"
            onClick={handleGiftClick}
          >
             <motion.div 
              animate={isExploding ? { opacity: [0, 0, 1] } : { opacity: 0 }}
              transition={{ duration: 4, times: [0, 0.9, 1] }}
              className="fixed inset-0 bg-white pointer-events-none z-[100]"
            />

            <motion.div
              animate={isExploding ? "exploding" : "idle"}
              variants={{
                idle: { rotate: [0, -2, 2, 0], scale: [1, 1.05, 1] },
                exploding: { 
                  rotate: [0, -5, 5, -10, 10, -20, 20, 0], 
                  scale: [1, 1.2, 1.5, 40], 
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(10)"],
                  transition: { 
                    rotate: { repeat: Infinity, duration: 0.4 }, 
                    scale: { duration: 4, ease: "easeIn" },
                    filter: { duration: 4 }
                  }
                }
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-[10rem] drop-shadow-2xl relative z-20"
            >
              🎁
            </motion.div>
            
            {!isExploding && (
               <p className="mt-4 text-rose-500 font-bold bg-white/50 backdrop-blur-sm px-4 py-1 rounded-lg animate-pulse">Tap me!</p>
            )}
          </motion.div>
        )}

       {/* STEP 3: REVEAL (BIGGER & BETTER) */}
{step === 3 && (
  <motion.div
    key="reveal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-pink-50/50"
  >
    
    {/* 1. TOP TITLE */}
    <div className="absolute top-[15%] left-0 right-0 flex flex-col items-center z-50">
      <motion.h1 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="text-6xl text-rose-600 font-['Great_Vibes'] drop-shadow-sm"
      >
        Motti👑
      </motion.h1>
    </div>

    {/* 2. IMAGE CONTAINER (NOW MUCH BIGGER) */}
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      // 👇 FIX 1: Increased Width/Height significantly (350px width!)
      className="relative mt-16 h-[650px] w-[550px] sm:h-[750px] sm:w-[650px]" 
    >
       {/* Glowing Aura */}
       <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-transparent via-purple-200/50 to-purple-400/50 blur-2xl -z-10"></div>
       
       <div className="relative w-full h-full rounded-[3rem] overflow-visible">
          {/* CROWN (BIGGER) */}
          <motion.img 
            src="/crown.png" 
            alt="Crown"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, opacity: 1,
              rotate: [-2, 2, -2],
              scale: [1, 1.05, 1],
              filter: ["drop-shadow(0 0 2px gold)", "drop-shadow(0 0 10px gold)", "drop-shadow(0 0 2px gold)"]
            }}
            transition={{ 
              delay: 1.5, type: "spring", stiffness: 80,
              rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              filter: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            // 👇 FIX 2: Increased width to 55% (was 40%) and recentered (Left 22.5%)
            className="absolute w-[20%] left-[38.8%] -top-[-23.8%] z-50 pointer-events-none"
          />

          {/* PHOTO */}
          <motion.img 
            src="/krisu.png" 
            alt="Krisu"
            className="w-full h-full object-contain drop-shadow-2xl z-10"
          />
       </div>
    </motion.div>

    {/* 3. BOTTOM TEXT */}
    <div className="absolute bottom-[20%] left-0 right-0 flex flex-col items-center z-50">
        <TypewriterLoop text="Keep Smiling..." speed={150} />
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }} 
          className="mt-4 text-rose-800 font-['Great_Vibes'] text-3xl tracking-wide text-center px-4"
        >
          The crown belongs to you,😍
        </motion.p>
    </div>

  </motion.div>
)}
      </AnimatePresence>
    </div>
  );
};

export default App;