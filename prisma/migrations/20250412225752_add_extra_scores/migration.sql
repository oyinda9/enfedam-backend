-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "assignment" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "attendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "classwork" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "midterm" DOUBLE PRECISION NOT NULL DEFAULT 0;
