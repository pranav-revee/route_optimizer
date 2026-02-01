"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Cpu,
  Plane,
  MapPin,
  Clock,
  ChevronRight,
  Github,
  Sparkles,
  Shield,
  Wifi,
  Zap
} from "lucide-react";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};


// Particle component for background
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Cursor glow effect
function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="cursor-glow"
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
      className="glass card-3d rounded-2xl p-8 cursor-pointer group"
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300" style={{ backgroundColor: '#D97757' }}>
        <Icon className="w-7 h-7 text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Tech Pill Component
function TechPill({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="glass tech-pill px-5 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap">
      {icon && <span>{icon}</span>}
      <span className="text-sm font-medium text-white/80">{label}</span>
    </div>
  );
}

// Floating Badge Component
function FloatingBadge({
  icon: Icon,
  label,
  position
}: {
  icon: typeof Shield;
  label: string;
  position: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className={`absolute ${position} glass rounded-full px-4 py-2 flex items-center gap-2 hidden lg:flex`}
    >
      <Icon className="w-4 h-4 text-teal-500" />
      <span className="text-sm text-white/80">{label}</span>
    </motion.div>
  );
}

// Main Page Component
export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const features = [
    {
      icon: Zap,
      title: "⚡ Saves You 20+ Minutes",
      description: "Smart routing across trains, bikes, and rideshares. We figure out what actually works—you just go."
    },
    {
      icon: MessageSquare,
      title: "💬 Tells You Why",
      description: "Not just 'take the train'—explains why it beats Uber today. No guessing, just answers."
    },
    {
      icon: Shield,
      title: "🔒 Works Everywhere",
      description: "No internet needed after setup. Your data never leaves your device. Free forever."
    }
  ];

  const techStack = [
    { label: "Smart AI", icon: "🧠" },
    { label: "Real-Time Data", icon: "⚡" },
    { label: "Multi-Modal", icon: "🚀" },
    { label: "Works Offline", icon: "📱" },
    { label: "Interactive Maps", icon: "🗺️" },
    { label: "Privacy-First", icon: "🔒" },
  ];

  return (
    <main className="relative min-h-screen">
      <CursorGlow />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 animated-gradient overflow-hidden"
      >
        {/* Transparent Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/train-station.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0" />

        <div className="grid-overlay" />
        <Particles />

        {/* Floating Badges */}
        <FloatingBadge icon={Shield} label="Privacy-First" position="top-32 left-20" />
        <FloatingBadge icon={Wifi} label="Works Offline" position="top-40 right-24" />
        <FloatingBadge icon={Zap} label="On-Device AI" position="bottom-40 left-32" />

        {/* Hero Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Free • No signup required
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Get Home.
            </span>
            <br />
            <span className="text-white">Don't Think About It.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            AI plans your entire journey in seconds—all modes, one smart route.
          </motion.p>

          {/* Scroll Down CTA */}
          <motion.div variants={fadeInUp}>
            <Link href="#search-section">
              <button className="btn-gradient text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-3 text-lg mx-auto">
                Plan My Route
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Search Section - Above Features */}
      <section id="search-section" className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="glass-light rounded-3xl p-8 md:p-10 glow-purple"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Where are you headed?</h2>
            <p className="text-white/60 text-center mb-8">Enter your route and get the smartest way there</p>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="From: Phoenix Sky Harbor"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 input-glow transition-all duration-300"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="To: Downtown Houston"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 input-glow transition-all duration-300"
                />
              </div>
            </div>

            <Link href="/chat">
              <button className="w-full btn-gradient text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center gap-3 text-lg">
                Optimize Route
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>

            <p className="text-center text-white/50 text-sm mt-4">Free • No signup • Get results in seconds</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Get Home. Don't Think About It.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-white/60 max-w-2xl mx-auto"
            >
              AI plans your entire journey in seconds—all modes, one smart route.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} delay={idx * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="glass-light rounded-3xl p-8 md:p-12 glow-cyan"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Sample Output */}
              <div>
                <h3 className="text-3xl font-bold mb-6">How It Works</h3>

                <div className="glass rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl">
                      🚂
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Recommended: Train + CitiBike</div>
                      <div className="text-sm text-white/60">JFK → Manhattan</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-teal-500">45</div>
                      <div className="text-xs text-white/50">minutes</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-500">$18</div>
                      <div className="text-xs text-white/50">total cost</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">A+</div>
                      <div className="text-xs text-white/50">eco-score</div>
                    </div>
                  </div>

                  <p className="text-base text-white/80 leading-relaxed">
                    "Train's 15min slower than Uber but saves you $45. Current surge pricing is 2.1x.
                    Plus you can grab coffee at Penn—there's a Starbucks promo while you wait."
                  </p>
                </div>

                <p className="text-white/60 mb-4 font-medium">Try it now with your own route</p>
                <Link href="/chat">
                  <button className="btn-gradient px-8 py-4 rounded-xl font-semibold flex items-center gap-2 text-lg">
                    Get My Route
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>

              {/* Map Preview */}
              <div className="relative aspect-square md:aspect-auto md:h-96 rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/map-preview.png"
                  alt="3D Route Map Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-lg text-white/40 mb-8"
          >
            Built With
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 overflow-x-auto pb-4 justify-center flex-wrap"
          >
            {techStack.map((tech, idx) => (
              <TechPill key={idx} {...tech} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-6 mb-6">
              <a
                href="https://github.com"
                target="_blank"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <Link
                href="/chat"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Live Demo
              </Link>
            </div>

            <p className="text-white/40 text-sm mb-4">
              Powered by public datasets. Privacy-preserving. No cloud required.
            </p>

            <p className="text-white/60 font-medium">
              Built by Pranav ✨
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
