import React, { useState } from 'react';
import { Plane, Mail, Lock, User, ArrowRight, Phone, Briefcase, ChevronDown, Eye, EyeOff, AlertTriangle, UserPlus } from 'lucide-react';
import { api } from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (user: { name: string; email: string; id: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usageType, setUsageType] = useState('self'); // 'self' | 'business'
  const [signupPassword, setSignupPassword] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { user, error } = await api.signIn(loginEmail, loginPassword);
        
        if (error) throw new Error(error.message);
        
        if (user) {
             let displayName = user.first_name 
                ? `${user.first_name} ${user.last_name || ''}`.trim()
                : '';
            
             if (!displayName && user.email) {
                 displayName = user.email.split('@')[0];
             }

            onLogin({
                name: displayName || 'Traveler',
                email: user.email,
                id: user.id
            });
        }
        
      } else {
        // --- SIGNUP LOGIC ---
        const newUser = {
            email: signupEmail,
            password: signupPassword,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            usage_type: usageType
        };

        const { user, error } = await api.signUp(newUser);

        if (error) throw new Error(error.message);

        if (user) {
            onLogin({
                name: `${firstName} ${lastName}`.trim(),
                email: signupEmail,
                id: user.id
            });
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred");
      console.error(error);
      
      // Auto-switch suggestion
      if (error.message?.includes('Sign Up')) {
          // Optional: Could automatically switch, but message is clearer
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
          let result;
          if ('signInAsGuest' in api) {
             result = await (api as any).signInAsGuest();
          } else {
             result = { 
                 user: { 
                    id: 'guest', 
                    first_name: 'Guest', 
                    last_name: 'User', 
                    email: 'guest@demo.com' 
                 }, 
                 error: null 
             };
          }
          
          if (result.error) throw new Error(result.error.message);
          onLogin({
             name: 'Guest Traveler',
             email: result.user.email,
             id: result.user.id
          });

      } catch (error: any) {
          setErrorMsg(error.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setErrorMsg(null);
    if (isLogin) {
        setFirstName('');
        setLastName('');
        setSignupEmail('');
        setPhone('');
        setSignupPassword('');
    } else {
        setLoginEmail('');
        setLoginPassword('');
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-[#131314] items-center justify-center p-4 overflow-y-auto transition-colors duration-300">
      <div className="w-full max-w-[500px] my-auto animate-in fade-in zoom-in duration-500 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/20 mx-auto mb-6">
            <Plane size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-[#E3E3E3] tracking-tight mb-3">
            Agentic Travel Planner
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {isLogin ? 'Welcome back, Explorer.' : 'Start your journey.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746]/30 rounded-3xl p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-200 text-sm text-center font-medium">
              {errorMsg}
              {errorMsg.includes('Sign Up') && (
                  <button 
                    onClick={handleToggle}
                    className="block w-full mt-2 text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
                  >
                      Go to Sign Up
                  </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- LOGIN FORM --- */}
            {isLogin && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                      placeholder="demo@example.com"
                    />
                  </div>
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                      placeholder="password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                        Forgot Password?
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- SIGNUP FORM --- */}
            {!isLogin && (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">First Name</label>
                        <div className="relative group">
                            <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                            placeholder="John"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Last Name</label>
                        <div className="relative group">
                            <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                            placeholder="Doe"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                        </div>
                        <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                        placeholder="traveler@example.com"
                        />
                    </div>
                   </div>

                   {/* Phone & Type Row */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                                </div>
                                <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                                placeholder="+91 98765 43210"
                                />
                            </div>
                       </div>

                       <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Usage Type</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                                </div>
                                <select
                                    value={usageType}
                                    onChange={(e) => setUsageType(e.target.value)}
                                    className="block w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="self">Personal</option>
                                    <option value="business">Business</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDown size={16} className="text-gray-500" />
                                </div>
                            </div>
                       </div>
                   </div>

                   {/* Create Password */}
                   <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Create Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                        </div>
                        <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#444746]/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-1 pt-1">
                      Must be at least 8 characters with symbols.
                    </p>
                   </div>
               </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 text-white font-medium py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] mt-6 
                bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-teal-900/20`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Guest Login Button */}
             {isLogin && (
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-[#1E1F20] px-2 text-gray-500">Or continue without account</span>
                    </div>
                </div>
            )}
            
            {isLogin && (
                <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl border border-gray-200 dark:border-[#444746]/50 hover:bg-gray-50 dark:hover:bg-[#28292a] transition-all"
                >
                     <UserPlus size={18} />
                     <span>Continue as Guest</span>
                </button>
            )}

          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={handleToggle}
                className="text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium transition-colors focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};