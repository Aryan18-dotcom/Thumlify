import { 
  ArrowLeft, Globe, Mail, Github, Sparkles, Target, Construction, Cpu, Wand2, MessageSquareText 
} from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-pink-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full h-14 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#303030] flex items-center justify-between px-6 z-50">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to App</span>
        </button>
        <div className="flex items-center gap-2">
            <span className="size-2 bg-pink-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Thumlify // v1.0</span>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        
        {/* Section 1: The Creator (About Me) */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#181818] p-2 rounded-2xl border border-[#303030]">
                <img 
                  src="public/assets/personal/ac-logo.png" 
                  alt="Aryan Chheda"
                  className="size-32 md:size-40 rounded-xl object-cover invert" 
                  onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=aryan'; }}
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-pink-500 font-mono text-sm mb-2 tracking-widest uppercase">The Mind Behind Thumlify</h2>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-white">Aryan Chheda.</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                I’m a Full Stack developer who loves making things look awesome, animated, and work like magic. 
                Basically, I build useful stuff that feels <span className="text-white italic">genuinely fun to click on.</span>
              </p>
              
              <div className="flex gap-4 mt-6 justify-center md:justify-start">
                <a href="https://ac-portfolio-phi.vercel.app" target="_blank" rel="noreferrer" className="p-2 bg-[#181818] border border-[#303030] rounded-lg hover:text-pink-500 transition-all">
                  <Globe size={20} />
                </a>
                <a href="https://github.com/Aryan18-dotcom" target="_blank" rel="noreferrer" className="p-2 bg-[#181818] border border-[#303030] rounded-lg hover:text-white transition-all">
                  <Github size={20} />
                </a>
                <a href="mailto:AryanChheda22@gmail.com" className="p-2 bg-[#181818] border border-[#303030] rounded-lg hover:text-blue-400 transition-all">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-[#303030] mb-24" />

        {/* Section 2: Project Thumlify */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter opacity-5 absolute left-0 right-0 pointer-events-none select-none uppercase">Thumbnail Magic</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-bold mb-4 relative z-10">
              <Sparkles size={14} /> AI-POWERED SAAS
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 relative z-10 tracking-tight">THUMLIFY.</h2>
            <p className="text-xl text-gray-400">Thumbnails + Ease = Thumlify</p>
          </div>

          {/* 1. What is it? */}
          <div className="bg-[#181818] p-8 rounded-3xl border border-[#303030] mb-8">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-pink-500/10 rounded-2xl">
                    <Wand2 size={28} className="text-pink-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-3">The Vision</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                        Thumlify is an AI-powered SaaS designed to create eye-catching, million-view thumbnails in under <span className="text-white font-bold">5 minutes</span>. We believe creators should spend time on their stories, not on learning complex design tools.
                    </p>
                </div>
            </div>
          </div>

          {/* 2 & 3: Tech Stack & Problem Solving */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-8 rounded-3xl border border-[#303030] bg-gradient-to-b from-[#181818] to-transparent">
              <Target size={32} className="text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">The Problem</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Thumbnails are the first thing users see on YouTube. But not every creator is a designer. Professional thumbnails usually require expensive software or hours of work. Thumlify solves this by turning a simple <span className="text-white italic">neat prompt</span> into a high-conversion visual.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-[#303030] bg-gradient-to-b from-[#181818] to-transparent">
              <Cpu size={32} className="text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">The Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by high-end <strong>Generative AI models</strong>, built with <strong>React</strong> and <strong>Tailwind CSS</strong>. We leverage modern prompt-engineering to ensure the output matches the exact vibe of your video explanation.
              </p>
            </div>
          </div>

          {/* 4. Future Updates */}
          <div className="p-8 rounded-3xl border border-[#303030] bg-[#121212] flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                    <Construction className="text-orange-500" size={24} />
                    <h3 className="text-2xl font-bold">What's Next?</h3>
                </div>
                <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center gap-2"><div className="size-1.5 bg-pink-500 rounded-full"></div> A/B Testing Integration for CTR.</li>
                    <li className="flex items-center gap-2"><div className="size-1.5 bg-pink-500 rounded-full"></div> Real-time Text overlays & Brand Kits.</li>
                    <li className="flex items-center gap-2"><div className="size-1.5 bg-pink-500 rounded-full"></div> Direct Export to YouTube Studio API.</li>
                </ul>
            </div>
            <div className="bg-[#181818] p-6 rounded-2xl border border-[#303030] w-full md:w-64 text-center">
                <p className="text-xs text-gray-500 uppercase mb-2">Beta Status</p>
                <div className="text-3xl font-black text-white">85%</div>
                <div className="w-full bg-[#303030] h-2 rounded-full mt-2 overflow-hidden">
                    <div className="w-[85%] h-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                Have ideas? <MessageSquareText className="text-blue-500" />
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                I'm always open to feedback or collaboration. If you've found a bug or want a feature, let's talk.
            </p>
            <a 
              href="mailto:AryanChheda22@gmail.com" 
              className="inline-block px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-pink-500 hover:text-white transition-all active:scale-95"
            >
              Get in Touch
            </a>
        </section>
      </main>

      <footer className="text-center py-10 border-t border-[#303030] text-gray-600 text-[10px] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} THUMLIFY • BY ARYAN CHHEDA
      </footer>
    </div>
  );
};

export default AboutUsPage;