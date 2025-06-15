'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistPill from '@/components/WaitlistPill';
import { ArrowRight } from 'lucide-react';

const NODE_LAUNCH_MODE = process.env.NEXT_PUBLIC_NODE_LAUNCH_MODE || 'waitlist';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    "Organize contacts intelligently",
    "Stay on top of relationships",
    "Protect your privacy",
    "Get smart insights",
    "Automate your networking",
    "Never miss a follow-up",
    "Built for busy professionals — not sales spam",
    "Remember everyone who matters — never drop the ball again",
    "Syncs contacts instantly, no manual import",
    "See all your last conversations at a glance"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className={`text-2xl font-bold transition-transform hover:scale-105 ${scrolled ? 'text-[#1E1E3F]' : 'text-white'}`}>Node</Link>
            <div className="hidden md:flex items-center space-x-8">
              {NODE_LAUNCH_MODE === 'live' ? (
                <Link 
                  href="/auth" 
                  className="px-5 py-2 bg-white/80 text-[#1E1E3F] rounded-full font-medium text-base shadow-sm hover:bg-white/90 transition-all duration-200 border border-[#e5e5f7]"
                >
                  Sign In
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-24 bg-transparent text-center relative overflow-hidden hero-content">
        {/* Animated background blobs and radial spotlight */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[480px] rounded-full opacity-60 blur-2xl" style={{background: 'radial-gradient(ellipse at center, #a259ff33 0%, #43e7ad22 60%, transparent 100%)'}} />
          <motion.div
            className="absolute left-[20%] top-[30%] w-[420px] h-[240px] rounded-full opacity-40 blur-3xl"
            style={{background: 'linear-gradient(135deg, #ff65d3 0%, #7e6aff 100%)'}}
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[10%] bottom-[18%] w-[360px] h-[200px] rounded-full opacity-30 blur-2xl"
            style={{background: 'linear-gradient(135deg, #30cfd0 0%, #7e6aff 100%)'}}
            animate={{ y: [0, -24, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto z-10 flex flex-col items-center justify-center gap-6 xl:gap-8 px-4">
          {/* Text + CTA */}
          <div className="flex flex-col items-center text-center max-w-3xl">
            {/* Animated headline with better typography hierarchy */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-2">
                Organize your network. <span className="bg-gradient-to-r from-[#ff65d3] to-[#7e6aff] bg-clip-text text-transparent">In seconds.</span>
              </h1>
            </motion.div>

            <motion.div
              className="space-y-3 mb-6 max-w-2xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
            >
              <p className="text-xl text-gray-300 font-normal tracking-wide leading-relaxed">
                Import once. Stay connected forever.
              </p>
              <p className="text-lg text-gray-400 font-light tracking-wide">
                No spreadsheets. No guesswork.
              </p>
            </motion.div>
            
            {/* CTAs with better spacing and alignment */}
            <div className="flex flex-col items-center space-y-6 w-full">
              {NODE_LAUNCH_MODE === 'waitlist' ? (
                <>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-xl flex justify-center">
                      <div className="w-full flex justify-center">
                        <WaitlistPill />
                      </div>
                    </div>
                  </div>
                  <motion.a
                    href="#demo"
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-base group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1 }}
                  >
                    <span>or watch a 20-second demo</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <ArrowRight size={16} strokeWidth={2} />
                    </motion.span>
                  </motion.a>
                </>
              ) : (
                <>
                  <motion.a
                    href="/auth"
                    className="px-10 py-5 bg-gradient-to-br from-[#ff65d3] via-[#7e6aff] to-[#30cfd0] text-white font-extrabold rounded-full flex items-center gap-2 shadow-xl hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_24px_0_rgba(255,101,211,0.24)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e6aff] border border-[#cba8fe70] transition-all duration-200 text-2xl relative overflow-hidden group"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.8, type: 'spring' }}
                  >
                    <motion.span 
                      className="mr-1 text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >✨</motion.span> Get Started Free
                    <ArrowRight className="ml-2 -mr-1" size={28} strokeWidth={2.2} />
                    <span className="absolute left-0 top-0 w-full h-full rounded-full pointer-events-none group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{backgroundSize: '200% 100%'}} />
                  </motion.a>
                  <motion.a
                    href="#demo"
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-base group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1 }}
                  >
                    <span>or watch a 20-second demo</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <ArrowRight size={16} strokeWidth={2} />
                    </motion.span>
                  </motion.a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GUIDED STEP WALKTHROUGH SECTION */}
      <section id="demo" className="py-32 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight text-center">Watch How It Works</h2>
          <p className="text-gray-300 text-lg font-light mb-12 text-center max-w-2xl">See how Node transforms your messy contacts into a powerful network in seconds.</p>
          <GuidedDemoWalkthrough />
        </div>
      </section>

      {/* CONVERSION CTA SECTION */}
      <section className="flex flex-col items-center justify-center py-32 pb-12 px-4 bg-transparent relative">
        {/* Faint radial gradient behind card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[520px] h-[320px] rounded-full mx-auto" style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03), transparent 80%)',
            filter: 'blur(2px)',
          }} />
        </div>
        <div className="w-full max-w-xl mx-auto text-center relative z-10">
          {NODE_LAUNCH_MODE === 'waitlist' ? (
            <div className="w-full flex justify-center">
              <div className="w-full max-w-xl flex justify-center">
                <div className="w-full flex justify-center">
                  <WaitlistPill />
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 80, damping: 18 }}
              className="bg-[#1b1e2c] backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-600/20 ring-1 ring-white/10 border border-white/10 px-8 py-10 flex flex-col items-center gap-4 mx-auto max-w-lg"
              style={{ boxShadow: '0 8px 44px 0 #15122b7a, 0 3px 18px 0 #ea51af34, 0 0px 2px 0 #30cacb34', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)' }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Ready to clean up your network?</h3>
              <div className="w-full flex flex-col items-center">
                <Link 
                  href="/auth" 
                  className="px-10 py-5 bg-gradient-to-br from-[#ff65d3] via-[#7e6aff] to-[#30cfd0] text-white font-extrabold rounded-full flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-[0_0_24px_0_rgba(255,101,211,0.24)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e6aff] border border-[#cba8fe70] transition-all duration-200 text-2xl relative overflow-hidden group"
                >
                  <span className="mr-1 text-2xl">✨</span> Clean My Network
                  <ArrowRight className="ml-2 -mr-1" size={28} strokeWidth={2.2} />
                  <span className="absolute left-0 top-0 w-full h-full rounded-full pointer-events-none group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{backgroundSize: '200% 100%'}} />
                </Link>
              </div>
              <div className="text-xs mt-2 font-medium tracking-wide opacity-75" style={{ color: '#d6aaff' }}>Join 500+ professionals already using Node</div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white mt-0 relative">
        {/* Gradient border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a259ff]/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#a259ff] font-bold text-lg">Node</span>
            <span className="text-gray-400 text-sm">Your Network, Organized.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#a259ff] transition-colors font-light tracking-wide">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#a259ff] transition-colors font-light tracking-wide">Terms</Link>
          </div>
          <div className="text-xs text-gray-400 mt-2 md:mt-0">Made with <span className="text-pink-400">♥</span> by the Node team</div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          background: linear-gradient(135deg, #181c2a 0%, #232946 100%);
          min-height: 100vh;
          scroll-behavior: smooth;
        }
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        h1, h2, h3, h4, h5, h6 {
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        p, span, a, button, input, select {
          letter-spacing: 0.01em;
        }
        .font-light { font-weight: 300; }
        .font-normal { font-weight: 400; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        h1 { font-size: 3.5rem; line-height: 1.1; letter-spacing: -0.03em; }
        h2 { font-size: 2.5rem; line-height: 1.2; letter-spacing: -0.02em; }
        h3 { font-size: 1.75rem; line-height: 1.3; letter-spacing: -0.01em; }
        p { line-height: 1.6; }
        .text-xl { line-height: 1.5; }
        nav a, button { font-weight: 500; letter-spacing: -0.01em; }
        /* Premium glassy card */
        .glass-card {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(12px);
          border-radius: 2rem;
          border: 1px solid rgba(255,255,255,0.18);
        }
        /* Vibrant accent gradient */
        .accent-gradient {
          background: linear-gradient(90deg, #a259ff 0%, #43e7ad 100%);
        }
        /* Animated shimmer for buttons */
        .shimmer {
          background: linear-gradient(90deg, #a259ff 0%, #43e7ad 50%, #a259ff 100%);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        /* Subtle background grid */
        .bg-grid {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* Add this to your global CSS for slow spin: */
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        .group-hover\:animate-shimmer:hover {
          animation: shimmer 1.2s linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; opacity: 0.2; }
          50% { background-position: 200% 0; opacity: 0.5; }
          100% { background-position: 200% 0; opacity: 0; }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .hero-content {
            padding-top: 2rem;
            padding-bottom: 3rem;
          }
          .preview-card {
            margin-top: 2rem;
            width: 100%;
            max-width: 100%;
          }
          .demo-pills {
            padding: 0.75rem;
            min-height: 3rem;
            width: 100%;
            justify-content: center;
          }
          .demo-pills span {
            font-size: 0.875rem;
          }
          .demo-content {
            padding: 1rem;
          }
          .demo-content h3 {
            font-size: 1.5rem;
            text-align: center;
          }
          .demo-content p {
            font-size: 1rem;
            text-align: center;
          }
          .demo-buttons {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }
          .demo-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

const demoSteps = [
  {
    label: 'Import',
    loomEmbed: 'https://www.loom.com/embed/2ec8d07482e74cfd8064bc406e0d3325',
    title: 'Import in Seconds',
    value: 'Connect Gmail or upload CSV—your contacts appear instantly.',
    cta: 'Import Now',
  },
  {
    label: 'Clean',
    video: '/videos/demo-clean.mp4',
    poster: '/videos/demo-clean-poster.png',
    title: 'Clean Instantly',
    value: 'Node merges duplicates, fixes names, and removes spam—so your network is always up to date.',
    cta: 'Clean Now',
  },
  {
    label: 'Enrich',
    video: '/videos/demo-enrich.mp4',
    poster: '/videos/demo-enrich-poster.png',
    title: 'Enrich Effortlessly',
    value: 'See company, title, and more added automatically—so you always have the full picture.',
    cta: 'Enrich Now',
  },
  {
    label: 'Export',
    video: '/videos/demo-export.mp4',
    poster: '/videos/demo-export-poster.png',
    title: 'Export Anywhere',
    value: 'Export to CSV, Google Contacts, or your favorite CRM—so your contacts are always exactly where you need them.',
    cta: 'Export Now',
  }
];

// Simple, elegant active pill
const pillActiveSimple = [
  'relative',
  'bg-[#a259ff]', // solid accent color
  'shadow-md',
  'scale-105',
  'transition-all duration-200',
  'border-none',
  'text-white',
  'font-bold',
  'outline-none',
].join(' ');

// Animation variants
const boxVariants = {
  initial: { opacity: 0, y: 6, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 900, damping: 22 } },
  exit: { opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.09, ease: 'easeIn' } },
};
const textVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30, delay: 0.03 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.13, ease: 'easeIn' } },
};
const progressVariants = {
  initial: { width: 0 },
  animate: (step: number) => ({ width: `${((step + 1) / demoSteps.length) * 100}%`, transition: { duration: 0.5, ease: 'easeInOut' } }),
};

function GuidedDemoWalkthrough() {
  const [step, setStep] = React.useState(0);
  const [completed, setCompleted] = React.useState(Array(demoSteps.length).fill(false));
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');

  const next = () => {
    if (step === demoSteps.length - 1) {
      // If going from last step to Step 1, reset all except Step 1
      setCompleted([true, false, false, false]);
      setStep(0);
      setDirection('forward');
    } else {
      setCompleted((prev) => {
        const updated = [...prev];
        updated[step] = true;
        return updated;
      });
      setDirection('forward');
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    // When moving backwards, reset completed state for all steps after current step
    setCompleted((prev) => {
      const updated = [...prev];
      for (let i = step; i < demoSteps.length; i++) {
        updated[i] = false;
      }
      return updated;
    });
    setDirection('backward');
    setStep((s) => (s - 1 + demoSteps.length) % demoSteps.length);
  };

  // Handle direct step clicks
  const handleStepClick = (clickedStep: number) => {
    if (clickedStep === step) return;
    
    setDirection(clickedStep > step ? 'forward' : 'backward');
    
    // If clicking a step before the current one, reset completed states
    if (clickedStep < step) {
      setCompleted((prev) => {
        const updated = [...prev];
        for (let i = clickedStep + 1; i < demoSteps.length; i++) {
          updated[i] = false;
        }
        return updated;
      });
    }
    
    setStep(clickedStep);
  };

  // Contextual CTA copy
  const ctaCopy = [
    'Try the Import Demo',
    'See Contacts Cleaned',
    'Watch Enrichment Live',
    'Download a Sample Export',
  ];

  // Tasteful animated SVG/MP4 placeholder
  const placeholderAnimation = (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
      <circle cx="60" cy="60" r="54" stroke="#4f5b93" strokeWidth="8" opacity="0.2" />
      <circle cx="60" cy="60" r="54" stroke="#a259ff" strokeWidth="8" strokeDasharray="339.292" strokeDashoffset="80" />
      <circle cx="60" cy="60" r="40" fill="#232946" />
      <rect x="40" y="55" width="40" height="10" rx="5" fill="#a259ff" />
      <rect x="50" y="70" width="20" height="6" rx="3" fill="#43e7ad" />
    </svg>
  );

  // Stepper pill styles
  const pillBase =
    'flex flex-col items-center px-4 py-2 rounded-full font-semibold text-base transition-all duration-400 focus:outline-none cursor-pointer relative';
  const pillInactive =
    'bg-white/5 text-gray-400 border border-[#2d3147] hover:bg-[#232946]/30 hover:text-white';
  const pillCompleted =
    'bg-gradient-to-r from-[#43e7ad]/10 to-[#a259ff]/10 text-[#43e7ad] border border-[#43e7ad]';

  return (
    <div className="w-full flex flex-col md:flex-row md:items-start md:justify-center gap-8 md:gap-12">
      {/* Stepper Pills (vertical on desktop) */}
      <div className="flex md:flex-col justify-center md:justify-start gap-3 md:gap-6 mb-4 md:mb-0 md:pt-8 md:min-w-[160px] md:sticky md:top-24 demo-pills">
        {demoSteps.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => handleStepClick(i)}
            className={
              pillBase +
              ' ' +
              (i === step
                ? pillActiveSimple + ' z-10'
                : completed[i]
                ? pillCompleted + ' z-0'
                : pillInactive + ' z-0')
            }
            style={{ minWidth: 120, minHeight: 52, fontSize: 18, position: 'relative', overflow: 'hidden' }}
            aria-current={i === step ? 'step' : undefined}
            whileHover={i === step ? { scale: 1.10 } : { scale: 1.04 }}
            animate={i === step ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            <span className={
              'text-[15px] font-bold mb-0.5 tracking-wide flex items-center justify-center min-w-[24px] min-h-[24px]' +
              (i === step ? ' text-white' : '')
            }>
              {completed[i] ? (
                <span className="flex items-center justify-center">
                  <AnimatedCheckmark show={completed[i]} />
                </span>
              ) : (
                i + 1
              )}
            </span>
            <span className={
              'tracking-tight text-lg font-semibold' +
              (i === step ? ' text-white' : '')
            }>{s.label}</span>
          </motion.button>
        ))}
      </div>
      {/* Demo Content */}
      <div className="flex-1 flex flex-col items-center md:items-start w-full">
        {/* Progress Bar (top on mobile, hidden on desktop) */}
        <div className="w-full max-w-lg h-2 bg-[#232946] rounded-full mb-4 overflow-hidden md:hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4f5b93] to-[#a259ff]"
            variants={progressVariants}
            initial="initial"
            animate="animate"
            custom={step}
          />
        </div>
        {/* Main active step */}
        <div className="relative flex items-center justify-center w-full" style={{ minHeight: 360 }}>
          {/* Left arrow */}
          {step > 0 && (
            <button
              onClick={prev}
              aria-label="Previous step"
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent text-white rounded-full p-2 shadow-none hover:bg-[#232946]/40 transition-all duration-300 z-10"
              style={{ fontSize: 40 }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {/* Demo box larger, animated, glassy */}
          <div className="mx-auto flex flex-col items-center w-full max-w-xl demo-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={boxVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="rounded-3xl overflow-hidden shadow-2xl border border-[#4f5b93] bg-[#232946] flex items-center justify-center mb-6 transition-all duration-400"
                style={{ minHeight: 300, minWidth: 420, height: 320 }}
              >
                {step === 0 ? (
                  <iframe
                    src={demoSteps[0].loomEmbed}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full rounded-3xl bg-[#232946]"
                    title="Loom Demo Step 1"
                  ></iframe>
                ) : (
                  placeholderAnimation
                )}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h3
                key={demoSteps[step].title}
                className="text-2xl md:text-3xl font-bold text-white mb-2 text-center md:text-left"
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {demoSteps[step].title}
              </motion.h3>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={demoSteps[step].value}
                className="text-gray-300 text-lg md:text-xl font-light text-center md:text-left mb-6 px-2"
                style={{ minHeight: 48 }}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {demoSteps[step].value}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-4 mb-2 demo-buttons">
              {step > 0 && (
                <button
                  onClick={prev}
                  aria-label="Previous step"
                  className="px-6 py-3 bg-gradient-to-r from-[#232946] to-[#3a3f5a] text-white rounded-full font-semibold text-base shadow-md hover:scale-105 transition-all duration-400 border border-[#4f5b93]"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={next}
                className="px-8 py-4 bg-gradient-to-r from-[#232946] to-[#3a3f5a] text-white rounded-full font-semibold text-lg shadow-md hover:scale-105 transition-all duration-400 border border-[#4f5b93]"
              >
                {step === demoSteps.length - 1 ? 'Back to Step 1' : ctaCopy[step]}
              </button>
            </div>
          </div>
          {/* Right arrow */}
          {step < demoSteps.length - 1 && (
            <button
              onClick={next}
              aria-label="Next step"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent text-white rounded-full p-2 shadow-none hover:bg-[#232946]/40 transition-all duration-300 z-10"
              style={{ fontSize: 40 }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// In AnimatedCheckmark, make the SVG smaller and more minimal
function AnimatedCheckmark({ show }: { show: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M6 13.5L11 18L18 7"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
      />
    </svg>
  );
}
