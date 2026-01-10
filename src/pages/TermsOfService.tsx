import { ArrowLeft, Scale } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen text-gray-400 font-sans px-6">
      <nav className="fixed top-0 left-0 w-full h-14 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#303030] flex items-center px-6 z-50">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
      </nav>

      <main className="pt-28 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Scale size={32} /></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Terms of Service</h1>
        </div>

        <div className="space-y-6 text-lg leading-relaxed">
          <p>By accessing <span className="text-white">Thumlify</span>, you agree to abide by these terms. Please read them carefully.</p>
          
          <section>
            <h2 className="text-white font-bold mb-2">1. Usage Rights</h2>
            <p>You own the rights to the thumbnails generated via Thumlify for your YouTube channel. However, you must not use our service for illegal or harmful content.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">2. AI Credits</h2>
            <p>Credits are non-transferable and are consumed upon each generation attempt. Misuse of the credit system may lead to account suspension.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">3. Limitations</h2>
            <p>Thumlify is an AI tool. While we strive for perfection, we are not responsible for the creative output or its direct impact on your video performance.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;