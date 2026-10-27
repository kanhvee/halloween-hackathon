import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, UtensilsCrossed, ChefHat, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error: signUpError } = await signUp(email, password, displayName, role);
      if (signUpError) {
        setError(signUpError);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Logo className="w-14 h-14" />
            <div>
              <span className="block text-2xl font-bold leading-none">
                Tiffin<span className="text-amber-200">Connect</span>
              </span>
              <span className="block text-xs text-orange-100 font-medium tracking-wide uppercase mt-1">
                Mumbai Home Tiffins
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Home-cooked tiffins,<br />
            delivered to your door
          </h1>
          <p className="text-orange-100 text-lg leading-relaxed max-w-md mb-8">
            Join Mumbai's largest home-cook tiffin marketplace. Browse authentic kitchens,
            subscribe to weekly plans, and enjoy real ghar ka khana every day.
          </p>
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-3 text-orange-50">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-sm">50+ home cooks across Mumbai</span>
            </div>
            <div className="flex items-center gap-3 text-orange-50">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-sm">Manage subscribers & daily menus</span>
            </div>
            <div className="flex items-center gap-3 text-orange-50">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm">Admin oversight & quality control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <Logo className="w-11 h-11" />
            <div>
              <span className="block text-xl font-bold text-gray-900 leading-none">
                Tiffin<span className="text-orange-600">Connect</span>
              </span>
              <span className="block text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">
                Mumbai Home Tiffins
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {mode === 'login'
                ? 'Log in to manage your tiffin subscriptions'
                : 'Join TiffinConnect in under a minute'}
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'customer', label: 'Customer', icon: UtensilsCrossed },
                      { value: 'cook', label: 'Cook', icon: ChefHat },
                      { value: 'admin', label: 'Admin', icon: ShieldCheck },
                    ] as { value: UserRole; label: string; icon: typeof UtensilsCrossed }[]).map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                            role === opt.value
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-orange-600 font-medium hover:text-orange-700"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
