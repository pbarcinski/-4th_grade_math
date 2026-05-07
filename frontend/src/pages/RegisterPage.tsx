import { useNavigate, Navigate } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  if (token) return <Navigate to="/" replace />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <RegisterForm onSuccess={() => navigate('/')} />
    </div>
  );
}
