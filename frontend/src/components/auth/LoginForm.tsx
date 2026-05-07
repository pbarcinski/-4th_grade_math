import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface Props {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: Props) {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authApi.login(email, password);
      login(user, token);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Błąd logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 w-full max-w-md mx-auto">
      <h1 className="font-display text-2xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
        Zaloguj się
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          label="Hasło"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••"
          required
          autoComplete="current-password"
        />
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Nie masz konta?{' '}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </Card>
  );
}
