import { ArrowLeft, ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen text-gray-400 font-sans px-6">
      <nav className="fixed top-0 left-0 w-full h-14 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#303030] flex items-center px-6 z-50">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
      </nav>

      <main className="pt-28 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500"><ShieldCheck size={32} /></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-lg leading-relaxed">
          <p>At <span className="text-white">Thumlify</span>, we value your privacy. This policy outlines how we handle your data when you use our AI services.</p>
          
          <section>
            <h2 className="text-white font-bold mb-2">1. Information Collection</h2>
            <p>We collect your email for account security and the prompts you provide for generating thumbnails. We do not store or use your personal images without permission.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">2. Data Usage</h2>
            <p>Your data is used strictly to improve thumbnail generation and provide account support. We never sell your personal information to third-party advertisers.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">3. Security</h2>
            <p>We use industry-standard encryption to protect your account and payment details. Your AI-generated content is private to your account.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;