-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'MULTIPLICATION',
ADD COLUMN     "conversionKey" TEXT;

-- AlterTable
ALTER TABLE "challenge_sessions" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'MULTIPLICATION';
