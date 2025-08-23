-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "sectionId" INTEGER;

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
