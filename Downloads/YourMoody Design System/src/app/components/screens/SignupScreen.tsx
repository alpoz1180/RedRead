import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MoodyButton } from '../MoodyButton';
import { MoodyInput } from '../MoodyInput';
import { MoodyCard } from '../MoodyCard';
import { toast } from 'sonner';
import { Logo } from '../Logo';

export function SignupScreen() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    const { error } = await signUp({ email, password, fullName });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Kayıt olunamadı');
    } else {
      toast.success('Kayıt başarılı! E-postanızı kontrol edin.');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title - Outside card */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-4xl">😊</span>
          </div>
          <h1 className="text-4xl font-nunito mb-2">
            <span className="font-normal text-foreground">Your</span>
            <span className="font-bold text-coral">Moody</span>
          </h1>
          <p className="text-muted-foreground text-sm">Mood'una yolculuğa başla</p>
        </div>

        {/* Signup Card - All inputs and button inside */}
        <div className="bg-card rounded-3xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adın ve Soyadın"
                autoComplete="name"
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                E-posta <span className="text-coral">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                Şifre <span className="text-coral">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                Şifre Tekrar <span className="text-coral">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreni tekrar gir"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral hover:bg-coral-dark text-white font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? 'Kayıt ediliyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Zaten hesabın var mı?{' '}
              <Link
                to="/login"
                className="text-coral hover:text-coral-dark font-semibold transition-colors"
              >
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
