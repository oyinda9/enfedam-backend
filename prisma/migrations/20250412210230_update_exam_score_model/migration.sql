/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the `ExamScore` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `examId` on table `Result` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ExamScore" DROP CONSTRAINT "ExamScore_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamScore" DROP CONSTRAINT "ExamScore_studentId_fkey";

-- DropForeignKey
ALTER TABLE "ExamScore" DROP CONSTRAINT "ExamScore_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_examId_fkey";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "assignmentId",
ALTER COLUMN "examId" SET NOT NULL;

-- DropTable
DROP TABLE "ExamScore";

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
