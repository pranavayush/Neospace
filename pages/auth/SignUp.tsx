import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Smile, CheckCircle, Eye, EyeOff, X, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RoutePath } from '../../types';
import { supabase } from '../../src/supabaseClient.js';
import { Logo } from '../../components/ui/Logo';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  let strength = 0;
  if (password.length > 0) strength += 1;
  if (hasMinLength) strength += 1;
  if (hasNumber || hasSpecial) strength += 1;
  if (hasUpper) strength += 1;

  const strengthText = 
    password.length === 0 ? '' :
    strength <= 1 ? 'Too Weak' :
    strength === 2 ? 'Fairly Strong' :
    strength === 3 ? 'Good Password' : 'Very Secure';

  const strengthColor =
    strength <= 1 ? 'bg-rose-500' :
    strength === 2 ? 'bg-amber-500' :
    strength === 3 ? 'bg-sky-500' : 'bg-emerald-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const displayName = formData.get('displayName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: displayName,
          }
        }
      });

      if (authError) {
        setError(authError.message);
      } else {
        // Sign out if session was automatically created to avoid auto-login
        if (data?.session) {
          await supabase.auth.signOut();
        }
        
        // Redirect to Sign In with success message and pre-filled email
        navigate(RoutePath.LOGIN, { 
          state: { 
            email,
            successMessage: 'Your account has been created. Please check your email and verify your address before logging in.'
          } 
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Note: No need to set loading(false) on success because OAuth redirects the page.
    } catch (err) {
      console.error("Google login error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans selection:bg-slate-950/20 ${activeTheme === 'midnight-black' ? 'bg-[#000000]' : activeTheme === 'sakura-pink' ? 'bg-[#FFF5F8]' : 'bg-[#F4F6F9]'}`}>
      
      {/* Cinematic Background - VisionOS Style */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
         {/* Animated Gradients */}
         <div className={`absolute top-[-20%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[140px] animate-pulse ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/5 mix-blend-screen' : 'bg-slate-200/30 mix-blend-multiply'}`} style={{ animationDuration: '9s' }} />
         <div className={`absolute bottom-[-20%] left-[-10%] w-[90vw] h-[90vw] rounded-full blur-[140px] animate-pulse ${activeTheme === 'midnight-black' ? 'bg-white/5 mix-blend-screen' : 'bg-slate-100/40 mix-blend-multiply'}`} style={{ animationDuration: '11s', animationDelay: '2s' }} />
         <div className={`absolute top-[30%] right-[40%] w-[60vw] h-[60vw] rounded-full blur-[120px] ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/5 mix-blend-screen' : 'bg-slate-200/20 mix-blend-multiply'}`} />
         
         {/* Noise Texture */}
         <div className={`absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${activeTheme === 'midnight-black' ? 'invert brightness-150' : 'brightness-100 contrast-150'}`}></div>
      </div>

      {/* Main Container - Floating Effect */}
      <div className="relative w-full max-w-[440px] px-6 transition-all duration-700 ease-out hover:-translate-y-2">
        
        {/* Liquid Glass Card */}
        <div className={`group relative overflow-hidden rounded-[36px] border p-8 sm:p-10 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.08),0_10px_20px_-5px_rgba(0,0,0,0.04)] backdrop-blur-[50px] transition-all duration-500 hover:shadow-[0_45px_80px_-12px_rgba(0,0,0,0.12),0_15px_30px_-5px_rgba(0,0,0,0.06)] ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#161616]/80 hover:bg-[#1C1C1E]' : 'border-white/60 bg-white/40 hover:bg-white/50'}`}>
          
          {/* Specular Top Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          <div className={`absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none ${activeTheme === 'midnight-black' ? 'from-white/5 via-transparent to-transparent' : 'from-white/40 via-transparent to-transparent'}`} />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Header Icon */}
            <div className={`mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] shadow-[0_12px_24px_-6px_rgba(0,0,0,0.3)] ring-4 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black ring-[#F7C948]/20' : 'bg-black text-white ring-white/55'}`}>
               {activeTheme === 'midnight-black' ? (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="#000" className="drop-shadow-sm">
                  <path d="M23.95 10.632C23.684 10.276 21.05 8.001 16.5 8.125C15.541 8.152 14.733 8.358 14.07 8.65C13.91 7.218 13.336 6.326 12.768 5.768L12.551 5.385C12.43 5.176 12.193 5 12 5C11.807 5 11.57 5.176 11.448 5.385L11.232 5.768C10.664 6.326 10.09 7.218 9.93 8.65C9.267 8.358 8.459 8.152 7.5 8.125C2.95 8.001 0.316 10.276 0.05 10.632C-0.088 10.817 0.04 11 0.25 11C2.5 11 4.5 11.5 5.5 13C6.446 14.419 6.84 16 6.84 16C6.84 16 8 15 10 13C11.134 11.866 11.5 11.5 12 11.5C12.5 11.5 12.866 11.866 14 13C16 15 17.159 16 17.159 16C17.159 16 17.554 14.419 18.5 13C19.5 11.5 21.5 11 23.75 11C23.96 11 24.088 10.817 23.95 10.632Z" />
                </svg>
               ) : (
                 <Logo size={42} theme={activeTheme} />
               )}
            </div>

            {/* Typography */}
            <h1 className={`text-3xl font-bold tracking-tight drop-shadow-sm text-center ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>
              Create Account
            </h1>
            <p className={`mt-2.5 text-[13px] font-medium text-center max-w-[280px] leading-relaxed ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
              Capture ideas, organize thoughts, and build your future. Protected by end-to-end encryption.
            </p>
          
            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10 w-full space-y-6">
              <div className="space-y-4">
                <Input 
                  id="fullName"
                  name="fullName"
                  type="text" 
                  required
                  placeholder="Full Name" 
                  icon={User}
                  theme={activeTheme}
                />
                <Input 
                  id="displayName"
                  name="displayName"
                  type="text" 
                  required
                  placeholder="Display Name (e.g. Jane)" 
                  icon={Smile}
                  theme={activeTheme}
                />
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  autoComplete="email" 
                  required
                  placeholder="Enter your email" 
                  icon={Mail}
                  theme={activeTheme}
                />
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password" 
                  icon={Lock}
                  theme={activeTheme}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`transition-colors p-1.5 rounded-xl ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1C1C1E]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                {password.length > 0 && (
                  <div className="mt-2.5 space-y-2 px-1 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className={activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}>Password Strength:</span>
                      <span className={`font-mono ${
                        strength <= 1 ? (activeTheme === 'midnight-black' ? 'text-red-400' : 'text-rose-600') :
                        strength === 2 ? (activeTheme === 'midnight-black' ? 'text-amber-400' : 'text-amber-600') :
                        strength === 3 ? (activeTheme === 'midnight-black' ? 'text-sky-400' : 'text-sky-600') : (activeTheme === 'midnight-black' ? 'text-emerald-400' : 'text-emerald-600')
                      }`}>{strengthText}</span>
                    </div>
                    {/* Multi-segment strength bar */}
                    <div className={`grid grid-cols-4 gap-1.5 h-1 w-full rounded-full overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-white/10' : 'bg-slate-200/50'}`}>
                      <div className={`h-full rounded-full transition-all duration-300 ${strength >= 1 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength >= 2 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength >= 3 ? strengthColor : 'bg-transparent'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength >= 4 ? strengthColor : 'bg-transparent'}`} />
                    </div>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${hasMinLength ? (activeTheme === 'midnight-black' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-emerald-100 text-emerald-700 font-bold') : (activeTheme === 'midnight-black' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {hasMinLength ? <Check size={10} strokeWidth={3} /> : '8'}
                        </span>
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${hasUpper ? (activeTheme === 'midnight-black' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-emerald-100 text-emerald-700 font-bold') : (activeTheme === 'midnight-black' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {hasUpper ? <Check size={10} strokeWidth={3} /> : 'A'}
                        </span>
                        <span>Uppercase Let</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${hasNumber ? (activeTheme === 'midnight-black' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-emerald-100 text-emerald-700 font-bold') : (activeTheme === 'midnight-black' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {hasNumber ? <Check size={10} strokeWidth={3} /> : '1'}
                        </span>
                        <span>One Number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${hasSpecial ? (activeTheme === 'midnight-black' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-emerald-100 text-emerald-700 font-bold') : (activeTheme === 'midnight-black' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {hasSpecial ? <Check size={10} strokeWidth={3} /> : '#'}
                        </span>
                        <span>Special Char</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className={`w-full h-[52px] text-[15px] mt-4 ${activeTheme === 'midnight-black' ? '!bg-none !bg-[#F7C948] border-0 hover:!bg-[#D4A017] !text-black shadow-[0_4px_20px_rgba(255,214,10,0.25)] hover:shadow-[0_8px_30px_rgba(255,214,10,0.4)]' : 'shadow-[0_20px_40px_-10px_rgba(15,23,42,0.25)]'}`}
                isLoading={loading}
              >
                Create Account
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className={`mt-4 flex w-full items-start justify-between gap-2.5 rounded-xl border p-3.5 text-sm backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-top-1 ${activeTheme === 'midnight-black' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-rose-200/60 bg-rose-50/80 text-rose-800'}`}>
                <span className="text-left font-medium leading-relaxed flex-1">{error}</span>
                <button 
                  type="button" 
                  onClick={() => setError(null)} 
                  className={`transition-colors p-0.5 rounded-md self-center ${activeTheme === 'midnight-black' ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : 'text-rose-450 hover:text-rose-700 hover:bg-rose-100/55'}`}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 flex w-full items-center gap-4">
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${activeTheme === 'midnight-black' ? 'via-white/20' : 'via-slate-200'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md border ${activeTheme === 'midnight-black' ? 'text-slate-500 bg-[#161616]/50 border-white/10' : 'text-slate-400 bg-white/30 border-white/40'}`}>Or</span>
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${activeTheme === 'midnight-black' ? 'via-white/20' : 'via-slate-200'}`} />
            </div>

            {/* Social Button */}
            <Button 
                variant="secondary" 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                theme={activeTheme}
                className="w-full h-[52px] gap-3 animate-pulse-subtle"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
                </svg>
                <span className={`font-semibold text-sm ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-700'}`}>Continue with Google</span>
            </Button>

            {/* Footer */}
            <p className={`mt-8 text-[13px] font-medium ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account? <Link to={RoutePath.LOGIN} className={`font-bold transition-colors hover:underline decoration-2 underline-offset-2 ${activeTheme === 'midnight-black' ? 'text-[#F7C948] hover:text-[#D4A017]' : 'text-slate-800 hover:text-black'}`}>Sign in</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};