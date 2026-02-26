import { BookOpen, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

const FEATURES = [
  {
    icon: "📚",
    title: "Any Format",
    desc: "Books, videos, articles, courses — one unified vault for everything you consume.",
  },
  {
    icon: "🏷️",
    title: "Smart Statuses",
    desc: "Track where you are: Currently Reading, Finished, Repeated, or Will Repeat.",
  },
  {
    icon: "🌐",
    title: "Public & Private",
    desc: "Share your insights with the world or keep your thoughts just for yourself.",
  },
  {
    icon: "👥",
    title: "Discover",
    desc: "Discover other readers, explore their vaults, and read their notes.",
  },
];

const TESTIMONIALS = [
  {
    avatar: "AK",
    name: "Alex K.",
    handle: "@alexreads",
    text: "I finally stopped losing the insights I get from books. NoteVault is the tool I didn't know I needed.",
  },
  {
    avatar: "SM",
    name: "Sara M.",
    handle: "@saralearnss",
    text: "The public/private toggle is brilliant. I share some notes, keep others personal. Perfect balance.",
  },
  {
    avatar: "JL",
    name: "James L.",
    handle: "@jlreads",
    text: "Discover other readers and seeing their notes is honestly the best feature. So much discovery.",
  },
];

  const scrollToTop    = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  
const STATUS_PILLS = [
  { label: "Currently Reading", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { label: "Finished", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { label: "Will Repeat", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { label: "Repeated", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
];

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const notes = useCounter(12400, 2000, statsVisible);
  const readers = useCounter(3200, 2000, statsVisible);
  const sources = useCounter(4, 1500, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Amber glow */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navScrolled ? "bg-[#0d0d0d]/90 backdrop-blur border-b border-white/5" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-ink-950" />
            </div>
            <span className="font-bold text-lg tracking-tight">NoteVault</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </a>
            <a
              href="/register"
              className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Try free →
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-sm mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Built because the right tool didn't exist
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6">
            Every great reader
            <br />
            <span className="italic text-amber-400">keeps notes.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Collect your thoughts on books, videos, articles and courses — all in one place.
            Discover others. Share what you learn. Remember everything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 active:scale-95"
            >
              Start your vault — it's free
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-xl text-base transition-colors"
            >
              See a demo vault →
            </a>
          </div>
        </div>

        {/* Floating note card preview */}
        <div className="relative max-w-2xl mx-auto mt-20">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-white/30 mb-1 uppercase tracking-widest">Book</div>
                <div className="font-bold text-lg">Atomic Habits</div>
                <div className="text-white/40 text-sm">James Clear</div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full">
                Finished
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed border-l-2 border-amber-500 pl-4 italic">
              "You do not rise to the level of your goals. You fall to the level of your systems." — The real insight here is that environment design matters more than motivation.
            </p>
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-xs text-white/30">
              <span>🔒 Private</span>
              <span>•</span>
              <span>3 days ago</span>
              <span className="ml-auto">5 💬</span>
            </div>
          </div>
          {/* Decorative blurred cards behind */}
          <div className="absolute -top-4 -left-4 -right-4 bg-[#161616]/50 border border-white/5 rounded-2xl h-full -z-10 blur-sm" />
          <div className="absolute -top-8 -left-8 -right-8 bg-[#161616]/30 border border-white/5 rounded-2xl h-full -z-20 blur-md" />
        </div>
      </section>


      {/* FEATURES */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Built for how you actually read
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-[#161616] border border-white/8 rounded-2xl p-7 hover:border-amber-500/30 transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-amber-400 transition-colors">{f.title}</h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATUS SECTION */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#161616] border border-white/8 rounded-3xl p-10 md:p-14">
            <div className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">Reading · Made meaningful</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Know where you stand with everything you've read
            </h2>
            <p className="text-white/50 mb-8 max-w-lg">
              Every item in your vault gets a status so you always know what you've finished, what you're returning to, and what's next.
            </p>
            <div className="flex flex-wrap gap-3">
              {STATUS_PILLS.map((s, i) => (
                <span
                  key={i}
                  className={`border rounded-full px-4 py-2 text-sm font-medium ${s.color}`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    
      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-8">
            📖
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
            Stop forgetting
            <br />
            <span className="text-amber-400 italic">what you read.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of readers who finally have a system for their reading life.
          </p>
          <a
            href="/register"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95"
          >
            Open your vault free →
          </a>
          <div className="text-white/25 text-sm mt-5">No credit card. No setup. Just start.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-xs">📖</div>
            <span className="font-semibold text-white/50">NoteVault</span>
          </div>
          <span>Built with MERN stack · Tailwind CSS</span>
          <a href="/" className="hover:text-white transition-colors">
            www.mynotevault.site
          </a>
        </div>
      </footer>

        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-8 z-50 w-11 h-11 bg-amber-500 hover:bg-amber-400 text-ink-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all"
          title="Back to top"
        >
          <ChevronUp size={20} />
        </button>
    </div>
  );
}
