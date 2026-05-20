import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { DEFAULT_AVATAR } from '@/lib/avatars';

interface Props {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const login = useAuthStore(s => s.login);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.register(username, email, password, avatar);
      if ('pendingConfirmation' in result) {
        setPendingConfirmation(true);
        return;
      }
      login(result.user, result.token);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Błąd rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingConfirmation) {
    return (
      <Card className="p-8 w-full max-w-md mx-auto text-center flex flex-col items-center gap-4">
        <div className="text-5xl">⏳</div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">Konto utworzone!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Twoje konto czeka na zatwierdzenie przez administratora.<br />
          Po zatwierdzeniu będziesz mógł się zalogować.
        </p>
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm">
          Wróć do logowania
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 w-full max-w-md mx-auto">
      <h1 className="font-display text-2xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
        Utwórz konto
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="username"
          label="Nazwa użytkownika"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="jan123"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jan@przyklad.pl"
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="Hasło (min. 6 znaków)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <AvatarPicker value={avatar} onChange={setAvatar} />
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
          {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Masz już konto?{' '}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Zaloguj się
        </Link>
      </p>
    </Card>
  );
}
