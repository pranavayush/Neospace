import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RoutePath } from '../../types';
import { supabase } from '../../src/supabaseClient.js';
import { Logo } from '../../components/ui/Logo';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans selection:bg-slate-950/20 ${activeTheme === 'midnight-black' ? 'bg-[#000000]' : activeTheme === 'sakura-pink' ? 'bg-[#FFF5F8]' : 'bg-[#F4F6F9]'}`}>
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
         <div className={`absolute top-[-20%] left-[-10%] w-[90vw] h-[90vw] rounded-full blur-[140px] animate-pulse ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/5 mix-blend-screen' : 'bg-slate-200/30 mix-blend-multiply'}`} style={{ animationDuration: '8s' }} />
         <div className={`absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[140px] animate-pulse ${activeTheme === 'midnight-black' ? 'bg-white/5 mix-blend-screen' : 'bg-slate-100/40 mix-blend-multiply'}`} style={{ animationDuration: '10s', animationDelay: '1s' }} />
         <div className={`absolute top-[40%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] rounded-full blur-[120px] ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/5 mix-blend-screen' : 'bg-slate-200/20 mix-blend-multiply'}`} />
         <div className={`absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${activeTheme === 'midnight-black' ? 'invert brightness-150' : 'brightness-100 contrast-150'}`}></div>
      </div>

      <div className="relative w-full max-w-[440px] px-6 transition-all duration-700 ease-out hover:-translate-y-2">
        <div className={`group relative overflow-hidden rounded-[36px] border p-8 sm:p-10 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.08),0_10px_20px_-5px_rgba(0,0,0,0.04)] backdrop-blur-[50px] transition-all duration-500 ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#161616]/80 hover:bg-[#1C1C1E]' : 'border-white/60 bg-white/40 hover:bg-white/50'}`}>
          
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          <div className={`absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none ${activeTheme === 'midnight-black' ? 'from-white/5 via-transparent to-transparent' : 'from-white/40 via-transparent to-transparent'}`} />
          
          <div className="relative z-10 flex flex-col items-center">
            
            <div className={`mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] shadow-[0_12px_24px_-6px_rgba(0,0,0,0.3)] ring-4 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black ring-[#F7C948]/20' : 'bg-black text-white ring-white/55'}`}>
               {activeTheme === 'midnight-black' ? (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="#000" className="drop-shadow-sm">
                  <path d="M23.95 10.632C23.684 10.276 21.05 8.001 16.5 8.125C15.541 8.152 14.733 8.358 14.07 8.65C13.91 7.218 13.336 6.326 12.768 5.768L12.551 5.385C12.43 5.176 12.193 5 12 5C11.807 5 11.57 5.176 11.448 5.385L11.232 5.768C10.664 6.326 10.09 7.218 9.93 8.65C9.267 8.358 8.459 8.152 7.5 8.125C2.95 8.001 0.316 10.276 0.05 10.632C-0.088 10.817 0.04 11 0.25 11C2.5 11 4.5 11.5 5.5 13C6.446 14.419 6.84 16 6.84 16C6.84 16 8 15 10 13C11.134 11.866 11.5 11.5 12 11.5C12.5 11.5 12.866 11.866 14 13C16 15 17.159 16 17.159 16C17.159 16 17.554 14.419 18.5 13C19.5 11.5 21.5 11 23.75 11C23.96 11 24.088 10.817 23.95 10.632Z" />
                </svg>
               ) : (
                 <Logo size={42} theme={activeTheme} />
               )}
            </div>

            <h1 className={`text-3xl font-bold tracking-tight drop-shadow-sm text-center ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>
              Forgot Password
            </h1>
            <p className={`mt-2.5 text-[13px] font-medium text-center max-w-[280px] leading-relaxed ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {success ? (
               <div className="mt-8 flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-top-2">
                  <div className={`flex w-full items-start gap-3 rounded-xl border p-4 text-sm backdrop-blur-md shadow-sm ${activeTheme === 'midnight-black' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200/60 bg-emerald-50/80 text-emerald-800'}`}>
                    <CheckCircle className={`mt-0.5 h-5 w-5 shrink-0 ${activeTheme === 'midnight-black' ? 'text-emerald-500' : 'text-emerald-600'}`} />
                    <span className="font-medium leading-relaxed">Check your email for a password reset link. It may take a few minutes.</span>
                  </div>
                  <Button 
                    variant="secondary"
                    className={`w-full mt-4 h-[52px] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10 hover:bg-[#2C2C2E] hover:border-white/20 text-white shadow-sm' : ''}`}
                    onClick={() => navigate(RoutePath.LOGIN)}
                  >
                    Back to Sign In
                  </Button>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-10 w-full space-y-6">
                  <div className="space-y-4">
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      autoComplete="email" 
                      required
                      placeholder="Enter your email" 
                      icon={Mail}
                      theme={activeTheme}
                      className={activeTheme === 'midnight-black' ? 'bg-[#111111] text-white focus:bg-[#111111] border-white/10' : 'bg-white/60 focus:bg-white'}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full h-[52px] text-[15px] ${activeTheme === 'midnight-black' ? '!bg-none !bg-[#F7C948] border-0 hover:!bg-[#D4A017] !text-black shadow-[0_4px_20px_rgba(255,214,10,0.25)] hover:shadow-[0_8px_30px_rgba(255,214,10,0.4)]' : 'shadow-[0_20px_40px_-10px_rgba(15,23,42,0.25)]'}`}
                    isLoading={loading}
                  >
                    Send Reset Link
                  </Button>
                </form>
            )}

            {error && (
              <div className={`mt-4 flex w-full items-start justify-between gap-2.5 rounded-xl border p-3.5 text-sm backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-top-1 ${activeTheme === 'midnight-black' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-rose-200/60 bg-rose-50/80 text-rose-800'}`}>
                <span className="text-left font-medium leading-relaxed flex-1">{error}</span>
                <button 
                  type="button" 
                  onClick={() => setError(null)} 
                  className={`transition-colors p-0.5 rounded-md self-center ${activeTheme === 'midnight-black' ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : 'text-rose-400 hover:text-rose-700 hover:bg-rose-100/55'}`}
                >
                  <X size={16} />
                </button>
              </div>
            )}

             <div className="my-8 flex w-full items-center gap-4">
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${activeTheme === 'midnight-black' ? 'via-white/20' : 'via-slate-200'}`} />
             </div>

             <Link to={RoutePath.LOGIN} className={`flex items-center justify-center gap-2 text-[13px] font-medium transition-colors ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
               <ArrowLeft size={16} />
               <span>Back to sign in</span>
             </Link>

          </div>
        </div>
      </div>
    </div>
  );
};
