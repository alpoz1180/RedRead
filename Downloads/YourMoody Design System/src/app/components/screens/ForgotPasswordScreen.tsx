import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MoodyButton } from '../MoodyButton';
import { MoodyInput } from '../MoodyInput';
import { MoodyCard } from '../MoodyCard';
import { toast } from 'sonner';
import { Logo } from '../Logo';

export function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Şifre sıfırlama e-postası gönderilemedi');
    } else {
      toast.success('Şifre sıfırlama bağlantısı e-postanıza gönderildi');
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <MoodyCard className="w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <Logo className="mb-4" />
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">E-postanı Kontrol Et</h1>
            <p className="text-gray-600 mb-8">
              <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              E-postanı kontrol et ve bağlantıya tıklayarak şifreni sıfırla.
            </p>
            <Link to="/login">
              <MoodyButton variant="primary">Giriş Sayfasına Dön</MoodyButton>
            </Link>
          </div>
        </MoodyCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <MoodyCard className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Şifremi Unuttum</h1>
          <p className="text-gray-600 mt-2 text-center">
            E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <MoodyInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
            />
          </div>

          <MoodyButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </MoodyButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Giriş sayfasına dön
          </Link>
        </div>
      </MoodyCard>
    </div>
  );
}
