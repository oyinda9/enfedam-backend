/*
  Warnings:

  - You are about to drop the column `SubjectId` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the `_ExamToSubject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `score` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ExamToSubject" DROP CONSTRAINT "_ExamToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToSubject" DROP CONSTRAINT "_ExamToSubject_B_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "SubjectId",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "title",
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "subjectId" INTEGER NOT NULL,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "_ExamToSubject";

-- CreateTable
CREATE TABLE "ExamScore" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "examId" INTEGER,

    CONSTRAINT "ExamScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamScore_studentId_subjectId_key" ON "ExamScore"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamScore" ADD CONSTRAINT "ExamScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamScore" ADD CONSTRAINT "ExamScore_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamScore" ADD CONSTRAINT "ExamScore_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
