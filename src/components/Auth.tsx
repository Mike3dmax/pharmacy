import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowRight, ShieldCheck, Zap, Activity, UserPlus, LogIn } from 'lucide-react';
import { signIn, auth } from '../lib/firebase';
import { cn } from '../lib/utils';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col font-sans selection:bg-natural-accent/10">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center shadow-lg shadow-natural-accent/20 text-white">
            <Package size={24} />
          </div>
          <span className="font-serif italic text-2xl font-bold tracking-tight text-natural-text-heading">PharmaLink</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-xs font-bold uppercase tracking-widest text-natural-text-label hover:text-natural-accent transition-colors">Features</a>
          <a href="#security" className="text-xs font-bold uppercase tracking-widest text-natural-text-label hover:text-natural-accent transition-colors">Security</a>
          <button 
            onClick={signIn}
            className="bg-natural-accent text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-natural-accent/20 hover:opacity-90 transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-natural-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-natural-accent/10 rounded-full blur-3xl" />

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-natural-accent mb-6 block">
              The Modern Pharmacist's Standard
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif italic text-natural-text-heading leading-[1.1] mb-8">
              Harmonizing <br />
              <span className="text-natural-accent">Pharmacy Flow</span> <br />
              with Precision.
            </h1>
            <p className="text-lg text-natural-text-muted leading-relaxed mb-10 max-w-md">
              A comprehensive intelligence system designed to streamline inventory, prescriptions, and sales analytics in a single, serene interface.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={signIn}
                className="bg-natural-accent text-white px-8 py-4 rounded-full text-sm font-bold shadow-xl shadow-natural-accent/30 hover:shadow-2xl hover:shadow-natural-accent/40 transition-all flex items-center gap-3"
              >
                Get Started Now <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-natural-border pt-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-natural-accent" />
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-natural-text-heading">Real-time Tracking</h5>
                </div>
                <p className="text-xs text-natural-text-muted leading-relaxed">Continuous sync across all pharmacy terminals.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-natural-accent" />
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-natural-text-heading">HIPAA Secure</h5>
                </div>
                <p className="text-xs text-natural-text-muted leading-relaxed">Enterprise-grade encryption for patient records.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="bg-white p-10 rounded-[64px] border border-natural-border shadow-2xl relative z-10">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif italic text-natural-text-heading">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <div className="flex bg-natural-sidebar p-1 rounded-full border border-natural-border">
                    <button 
                      onClick={() => setIsLogin(true)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                        isLogin ? "bg-white text-natural-accent shadow-sm" : "text-natural-text-label"
                      )}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setIsLogin(false)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                        !isLogin ? "bg-white text-natural-accent shadow-sm" : "text-natural-text-label"
                      )}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-sm text-natural-text-muted leading-relaxed">
                    Access high-fidelity pharmacy tools with your clinical credentials. PharmaLink uses secure, encrypted authentication for data integrity.
                   </p>
                   
                   <button 
                    onClick={signIn}
                    className="w-full flex items-center justify-center gap-3 bg-natural-bg border border-natural-border p-4 rounded-3xl hover:bg-natural-sidebar transition-all group"
                   >
                    <div className="w-6 h-6 bg-white rounded-full border border-natural-border flex items-center justify-center">
                      <Zap size={12} className="text-natural-accent" />
                    </div>
                    <span className="text-sm font-bold text-natural-text-heading">Continue with Google Cloud</span>
                    <ArrowRight size={16} className="text-natural-text-label group-hover:translate-x-1 transition-transform" />
                   </button>
                   
                   {!isLogin && (
                     <div className="flex items-start gap-3 p-4 bg-natural-accent/5 rounded-3xl border border-natural-accent/10">
                       <ShieldCheck className="text-natural-accent mt-0.5" size={18} />
                       <p className="text-[10px] font-medium text-natural-accent leading-relaxed">
                        By registering, you agree to our Clinical Compliance Standards and Patient Data Privacy Agreements.
                       </p>
                     </div>
                   )}
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-natural-text-label font-bold uppercase tracking-widest">
                    Authorized Personnel Only
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-natural-sidebar rounded-[32px] border border-natural-border -z-10 animate-spin-slow" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-natural-card rounded-[48px] border border-natural-border -z-10" />
          </motion.div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="py-24 px-8 bg-natural-sidebar border-t border-natural-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-natural-border text-natural-accent">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-natural-text-heading">HIPAA Compliant</h4>
              <p className="text-[10px] text-natural-text-label font-bold">Standard Data Encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-natural-border text-natural-accent">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-natural-text-heading">Real-time Sync</h4>
              <p className="text-[10px] text-natural-text-label font-bold">Cloud-First Architecture</p>
            </div>
          </div>
          <div className="p-10 border-l border-natural-border md:block hidden" />
          <div className="text-right">
            <p className="text-sm font-serif italic text-natural-text-muted mb-1">\"PharmaLink has transformed our workflow efficiency by 40% in just six months.\"</p>
            <p className="text-xs font-bold uppercase tracking-widest text-natural-accent">Dr. Marcus Vane • Chief Pharmacist</p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}} />
    </div>
  );
}
