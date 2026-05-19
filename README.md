# Matematyka 4 — Mnożenie i Dzielenie

Aplikacja PWA do nauki mnożenia i dzielenia do 100 dla dzieci z klasy 4.
Dostępna pod adresem: **http://pbes.tojest.dev/math4/**

---

## Funkcje

- **Tryb Nauki** — fiszki z pytaniami, podpowiedź (tabliczka mnożenia), feedback po odpowiedzi
- **Tryb Challenge** — 60-sekundowy wyścig z czasem, zapis wyników
- **Konta użytkowników** — rejestracja, logowanie JWT, zapis postępów
- **Ranking** — top 10 wszystkich graczy
- **Słabe obszary** — automatyczne wykrywanie, gdzie dziecko robi błędy
- **Tryb ciemny/jasny** — niebieska kolorystyka
- **PWA** — instalowalna na telefonie jak aplikacja

---

## Architektura

```
Przeglądarka
     │
     ▼
nginx (pbes.tojest.dev)
     ├── /math4/          →  pliki statyczne  /opt/math4/frontend/dist/
     └── /math4/api/      →  Node.js backend  :3001
                                   │
                                   ▼
                             PostgreSQL :5432
```

### Stack

| Warstwa     | Technologie                                                   |
|-------------|---------------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand, TanStack Query, vite-plugin-pwa |
| Backend     | Node.js, Express 4, TypeScript, Prisma ORM                    |
| Baza danych | PostgreSQL (prod) / PostgreSQL w Docker (dev)                 |
| Auth        | JWT (jsonwebtoken) + bcrypt                                   |
| Hosting     | Mikrus VPS — systemd + nginx                                  |

---

## Struktura katalogów

```
/
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app — CORS, helmet, routes
│   │   ├── config.ts            # Zmienne środowiskowe
│   │   ├── index.ts             # Start serwera
│   │   ├── controllers/         # Obsługa requestów HTTP
│   │   │   ├── auth.controller.ts
│   │   │   ├── questions.controller.ts
│   │   │   ├── sessions.controller.ts
│   │   │   └── users.controller.ts
│   │   ├── services/            # Logika biznesowa
│   │   │   ├── auth.service.ts
│   │   │   ├── questions.service.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── users.service.ts
│   │   ├── routes/              # Definicje endpointów
│   │   ├── middleware/          # auth.ts, validate.ts, errorHandler.ts
│   │   └── lib/                 # jwt.ts, prisma.ts
│   └── prisma/
│       ├── schema.prisma        # Schemat bazy danych
│       └── migrations/
├── frontend/
│   └── src/
│       ├── pages/               # Widoki (każdy to osobna trasa React Router)
│       ├── components/
│       │   ├── ui/              # Button, Card, Input, Spinner, ThemeToggle
│       │   ├── layout/          # AppShell, Navbar, ProtectedRoute
│       │   ├── learn/           # FlashCard, AnswerInput, HintPanel, FeedbackBanner
│       │   ├── challenge/       # ChallengeQuestion, CountdownTimer, ScoreBadge
│       │   ├── results/         # ScoreSummary, WeakAreasList
│       │   ├── leaderboard/     # LeaderboardTable
│       │   ├── profile/         # SessionHistory, StatCard
│       │   └── auth/            # LoginForm, RegisterForm
│       ├── api/                 # Klienty HTTP (axios) dla każdej domeny
│       ├── store/               # Stan globalny Zustand
│       │   ├── authStore.ts     # Token JWT, dane zalogowanego użytkownika
│       │   ├── gameStore.ts     # Stan trwającej sesji gry
│       │   └── themeStore.ts    # dark/light mode
│       └── types/               # Wspólne typy TypeScript
├── deploy/
│   ├── setup.sh                 # Jednorazowy setup serwera
│   ├── update.sh                # Aktualizacja po git push
│   └── math4-backend.service   # Jednostka systemd
└── .github/workflows/
    └── deploy.yml               # CI/CD — auto deploy na push do main
```

---

## Baza danych

```
users
  id (uuid)  username  email  passwordHash  createdAt

answers
  id  userId  operandA  operandB  operation(MULTIPLY|DIVIDE)
  givenAnswer  isCorrect  mode(LEARN|CHALLENGE)  sessionId?  answeredAt

challenge_sessions
  id  userId  startedAt  endedAt  durationSecs  score  totalAsked  completed
```

Relacje: `User → Answer[]`, `User → ChallengeSession[]`, `ChallengeSession → Answer[]`

---

## API

Bazowy URL: `/math4/api/v1`

### Auth
| Metoda | Endpoint         | Auth | Opis                        |
|--------|------------------|------|-----------------------------|
| POST   | /auth/register   | —    | Rejestracja (username, email, password) |
| POST   | /auth/login      | —    | Logowanie → zwraca JWT token |
| POST   | /auth/logout     | JWT  | Wylogowanie                 |

### Użytkownik
| Metoda | Endpoint         | Auth | Opis                        |
|--------|------------------|------|-----------------------------|
| GET    | /users/me        | JWT  | Dane zalogowanego użytkownika |
| GET    | /users/me/stats  | JWT  | Statystyki (celność, liczba odpowiedzi) |
| GET    | /users/me/sessions | JWT | Historia sesji challenge   |

### Pytania
| Metoda | Endpoint           | Auth | Opis                              |
|--------|--------------------|------|-----------------------------------|
| GET    | /questions/next    | JWT  | Następne pytanie (z wagowaniem słabych obszarów) |
| POST   | /questions/answer  | JWT  | Zapisz odpowiedź (operandA, operandB, operation, givenAnswer, mode) |

### Sesje Challenge
| Metoda | Endpoint                   | Auth | Opis                    |
|--------|----------------------------|------|-------------------------|
| POST   | /sessions                  | JWT  | Rozpocznij sesję        |
| PATCH  | /sessions/:id/end          | JWT  | Zakończ sesję (score, totalAsked) |
| GET    | /sessions/leaderboard      | JWT  | Top 10 graczy           |
| GET    | /sessions/personal-best    | JWT  | Najlepszy wynik gracza  |

---

## Uruchomienie lokalne

### 1. PostgreSQL przez Docker

```bash
docker run -d --name math4-db \
  -e POSTGRES_USER=math -e POSTGRES_PASSWORD=math -e POSTGRES_DB=math4 \
  -p 5432:5432 postgres:16-alpine
```

Następnym razem: `docker start math4-db`

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate deploy   # tworzy tabele (pierwsze uruchomienie)
npm run dev                 # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Zmienne środowiskowe backendu (`backend/.env`):
```
DATABASE_URL="postgresql://math:math@localhost:5432/math4"
JWT_SECRET="zmien-mnie-na-produkcji"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

---

## Deployment (Mikrus)

### Jednorazowy setup serwera

```bash
ssh root@srv65.mikr.us -p 10201
git clone https://github.com/pbarcinski/-4th_grade_math.git /opt/math4
bash /opt/math4/deploy/setup.sh
```

Skrypt automatycznie:
- instaluje Node.js 18, PostgreSQL, nginx
- buduje backend i frontend
- uruchamia serwis systemd `math4-backend`
- wstrzykuje location bloki `/math4/` do nginx

### Ciągłe wdrożenia

Każdy `git push` do `main` → GitHub Actions → SSH na serwer → `update.sh`

```
git push origin main   # → auto deploy za ~60 sekund
```

Wymagany sekret w repozytorium GitHub: `MIKRUS_SSH_KEY`

### Logi i zarządzanie na serwerze

```bash
systemctl status math4-backend
journalctl -fu math4-backend
bash /opt/math4/deploy/update.sh   # ręczna aktualizacja
```
