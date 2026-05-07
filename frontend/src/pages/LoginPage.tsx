import { useNavigate, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  if (token) return <Navigate to="/" replace />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <LoginForm onSuccess={() => navigate('/')} />
    </div>
  );
}
