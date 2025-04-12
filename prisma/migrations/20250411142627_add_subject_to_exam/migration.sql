/*
  Warnings:

  - You are about to drop the column `lessonId` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `SubjectId` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "lessonId",
ADD COLUMN     "SubjectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_ExamToSubject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExamToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExamToSubject_B_index" ON "_ExamToSubject"("B");

-- AddForeignKey
ALTER TABLE "_ExamToSubject" ADD CONSTRAINT "_ExamToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamToSubject" ADD CONSTRAINT "_ExamToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
