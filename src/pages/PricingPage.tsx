import { motion } from "framer-motion";
import { CheckIcon, Sparkles, Zap, Crown, ShieldCheck } from "lucide-react";
import SoftBackDrop from "../components/SoftBackDrop";
import SectionTitle from "../components/SectionTitle";
import { pricingData } from "../data/pricing";
import type { IPricing } from "../types";

const PricingPage = () => {
  return (
    <div className="relative min-h-screen text-zinc-200 selection:bg-pink-500/30 overflow-x-hidden">
      <SoftBackDrop />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-16 lg:px-24">
        {/* Header Section */}
        <SectionTitle 
          text1="Pricing" 
          text2="Simple, Transparent Pricing" 
          text3="Choose the plan that's right for your creative journey. No hidden fees, cancel anytime." 
        />

        {/* Pricing Grid */}
        <div className="flex flex-wrap items-stretch justify-center gap-8 mt-20 max-w-7xl mx-auto">
          {pricingData.map((plan: IPricing, index: number) => {
            const isPopular = plan.mostPopular;
            
            return (
              <motion.div 
                key={index} 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative w-full max-w-sm flex flex-col p-8 rounded-3xl border transition-all duration-500 group
                  ${isPopular 
                    ? 'bg-gradient-to-b from-pink-500/10 to-transparent border-pink-500/40 shadow-[0_0_40px_rgba(236,72,153,0.1)]' 
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-pink-600 to-pink-400 rounded-full shadow-lg">
                    <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="size-3" /> Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isPopular ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-zinc-400'}`}>
                      {index === 0 ? <Zap className="size-5" /> : index === 1 ? <Crown className="size-5" /> : <ShieldCheck className="size-5" />}
                    </div>
                    <p className="font-bold text-lg tracking-tight text-white">{plan.name}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">₹{plan.price}</span>
                    <span className="text-zinc-500 font-medium">/{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className="mt-1 size-5 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                        <CheckIcon className="size-3 text-pink-500" strokeWidth={3} />
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{feature}</p>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button 
                  type="button" 
                  className={`relative w-full py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 overflow-hidden
                    ${isPopular 
                      ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/25' 
                      : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <span className="relative z-10">Get Started Now</span>
                  {isPopular && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section Hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 text-center"
        >
          <p className="text-zinc-500 text-sm">
            Have questions? <a href="#" className="text-pink-500 hover:underline">Check our documentation</a> or contact support.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default PricingPage;