-- Użytkownicy zarejestrowani przed wprowadzeniem systemu zatwierdzeń
-- są traktowani jako automatycznie zatwierdzeni.
UPDATE "users" SET "confirmed" = true WHERE "confirmed" = false;
