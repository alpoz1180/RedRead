"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { ANIMATION } from '../constants/design';

type AuthMode = 'login' | 'register';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (mode === 'register') {
          if (!username.trim()) {
            setError('Kullanıcı adı gerekli');
            setLoading(false);
            return;
          }
          if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir');
            setLoading(false);
            return;
          }
          const { error } = await signUp(email, password, username);
          if (error) {
            setError(error.message);
          }
        } else {
          const { error } = await signIn(email, password);
          if (error) {
            setError(error.message);
          }
        }
      } catch {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, username, signIn, signUp]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  }, [signInWithGoogle]);

  const handleAppleSignIn = useCallback(async () => {
    setError(null);
    const { error } = await signInWithApple();
    if (error) {
      setError(error.message);
    }
  }, [signInWithApple]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0909] flex items-center justify-center px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#E85D7A15_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#E8E6E1] mb-3">Redread</h1>
          <p className="text-[#E8E6E1]/60 text-sm">Hikayeler, duygular, anılar...</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0B0B0B] border border-[#E8E6E1]/10 rounded-2xl p-8 backdrop-blur-sm">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-[#0A0909] rounded-xl p-1">
            <button
              type="button"
              onClick={() => mode !== 'login' && toggleMode()}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-${ANIMATION.BOOKMARK_SLIDE} ${
                mode === 'login'
                  ? 'bg-[#E85D7A] text-white'
                  : 'text-[#E8E6E1]/50 hover:text-[#E8E6E1]/80'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => mode !== 'register' && toggleMode()}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-${ANIMATION.BOOKMARK_SLIDE} ${
                mode === 'register'
                  ? 'bg-[#E85D7A] text-white'
                  : 'text-[#E8E6E1]/50 hover:text-[#E8E6E1]/80'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-xl transition-all duration-200 border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google ile Devam Et
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-medium py-3.5 rounded-xl transition-all duration-200 border border-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple ile Devam Et
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E6E1]/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#0B0B0B] text-[#E8E6E1]/40">veya</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="username" className="block text-sm text-[#E8E6E1]/70 mb-2">
                    Kullanıcı Adı
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0A0909] border border-[#E8E6E1]/20 rounded-xl px-4 py-3 text-[#E8E6E1] placeholder:text-[#E8E6E1]/30 focus:outline-none focus:border-[#E85D7A] transition-colors"
                    placeholder="kullaniciadi"
                    required={mode === 'register'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-sm text-[#E8E6E1]/70 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0909] border border-[#E8E6E1]/20 rounded-xl px-4 py-3 text-[#E8E6E1] placeholder:text-[#E8E6E1]/30 focus:outline-none focus:border-[#E85D7A] transition-colors"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#E8E6E1]/70 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0909] border border-[#E8E6E1]/20 rounded-xl px-4 py-3 text-[#E8E6E1] placeholder:text-[#E8E6E1]/30 focus:outline-none focus:border-[#E85D7A] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E85D7A] hover:bg-[#E85D7A]/90 disabled:bg-[#E85D7A]/50 text-white font-medium py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Yükleniyor...
                </span>
              ) : mode === 'login' ? (
                'Giriş Yap'
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Footer Help Text */}
          <p className="text-center text-[#E8E6E1]/40 text-xs mt-6">
            {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#E85D7A] hover:text-[#E85D7A]/80 font-medium"
            >
              {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
