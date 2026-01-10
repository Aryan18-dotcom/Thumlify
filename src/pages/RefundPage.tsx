import { ArrowLeft, ReceiptIndianRupee } from 'lucide-react';

const RefundPolicy = () => {

  return (
    <div className="min-h-screen text-gray-400 font-sans px-6">
      <nav className="fixed top-0 left-0 w-full h-14 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#303030] flex items-center px-6 z-50">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
      </nav>

      <main className="pt-28 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500"><ReceiptIndianRupee size={32} /></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Refund Policy</h1>
        </div>

        <div className="space-y-6 text-lg leading-relaxed">
          <p>We aim for 100% satisfaction, but because <span className="text-white">Thumlify</span> uses real-time AI processing, we have specific refund rules.</p>
          
          <section>
            <h2 className="text-white font-bold mb-2">1. AI Generations</h2>
            <p>Because each generation costs server processing power, we cannot offer refunds once a credit has been used to create a thumbnail.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">2. Subscription Errors</h2>
            <p>If you were charged accidentally for a subscription and have used <span className="text-white">zero credits</span>, you are eligible for a refund within 7 days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">3. Support</h2>
            <p>If you have any issues with your payment, please email us at <a href='mailto:Aryanchheda22@gmail.com' className="text-pink-500 underline">AryanChheda22@gmail.com</a> with your transaction details.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;