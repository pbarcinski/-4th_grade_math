import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { User } from '@/types';
import { CheckCircle, Trash2, Clock, Shield } from 'lucide-react';
import { DEFAULT_AVATAR } from '@/lib/avatars';

export function AdminPanel() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => adminApi.confirmUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  if (isLoading) return <p className="text-sm text-gray-400">Ładowanie użytkowników...</p>;

  const users = data?.users ?? [];
  const pending = users.filter(u => !u.confirmed);
  const confirmed = users.filter(u => u.confirmed);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Shield size={18} className="text-blue-500" />
        Panel administratora
      </h2>

      {pending.length > 0 && (
        <div>
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
            <Clock size={14} /> Oczekujące na zatwierdzenie ({pending.length})
          </p>
          <div className="flex flex-col gap-2">
            {pending.map(u => (
              <UserRow
                key={u.id}
                user={u}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onConfirm={() => confirmMutation.mutate(u.id)}
                onDelete={() => deleteMutation.mutate(u.id)}
                confirming={confirmMutation.isPending}
                deleting={deleteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Wszyscy użytkownicy ({confirmed.length})
        </p>
        <div className="flex flex-col gap-2">
          {confirmed.map(u => (
            <UserRow
              key={u.id}
              user={u}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              onConfirm={() => confirmMutation.mutate(u.id)}
              onDelete={() => deleteMutation.mutate(u.id)}
              confirming={confirmMutation.isPending}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  user: User;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  onConfirm: () => void;
  onDelete: () => void;
  confirming: boolean;
  deleting: boolean;
}

function UserRow({ user, confirmDelete, setConfirmDelete, onConfirm, onDelete, confirming, deleting }: RowProps) {
  const isAdmin = user.role === 'ADMIN';
  const awaitingDelete = confirmDelete === user.id;

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
      <span className="text-xl leading-none">{user.avatar ?? DEFAULT_AVATAR}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.username}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      {isAdmin && (
        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
          admin
        </span>
      )}
      {!user.confirmed && (
        <button
          onClick={onConfirm}
          disabled={confirming}
          title="Zatwierdź konto"
          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors"
        >
          <CheckCircle size={16} />
        </button>
      )}
      {!isAdmin && (
        awaitingDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-500">Na pewno?</span>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Usuń
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
            >
              Anuluj
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(user.id)}
            title="Usuń konto"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )
      )}
    </div>
  );
}
