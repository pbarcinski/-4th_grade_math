# Matematyka 4 — Mnożenie i Dzielenie

Aplikacja PWA do nauki mnożenia i dzielenia do 100 dla dzieci z klasy 4.

## Funkcje

- **Tryb Nauki** — fiszki z pytaniami, podpowiedź (tabliczka mnożenia), feedback po odpowiedzi
- **Tryb Challenge** — 60-sekundowy wyścig z czasem, zapis wyników
- **Konta użytkowników** — rejestracja, logowanie, zapis postępów
- **Ranking** — top 10 wszystkich graczy
- **Słabe obszary** — automatyczne wykrywanie, gdzie dziecko robi błędy
- **Tryb ciemny/jasny** — niebieska kolorystyka
- **PWA** — instalowalna na telefonie jak aplikacja

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, PWA
- **Backend**: Node.js + Express + TypeScript, Prisma ORM, SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT + bcrypt

## Uruchomienie

### Backend

```bash
cd backend
npm install
npx prisma migrate dev   # pierwsza migracja
npm run dev              # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### Produkcja (build)

```bash
cd frontend
npm run build            # dist/
```

## Zmiana na PostgreSQL

W `backend/.env` zmień:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/math4"
```
I w `backend/prisma/schema.prisma` zmień `provider = "sqlite"` na `provider = "postgresql"`.
