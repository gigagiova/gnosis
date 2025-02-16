/*
  Warnings:

  - You are about to drop the column `status` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `snippet_end` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `snippet_start` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `threads` table. All the data in the column will be lost.
  - Added the required column `essay_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_index` to the `threads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_index` to the `threads` table without a default value. This is not possible if the table is not empty.
  - Made the column `snippet_text` on table `threads` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_thread_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "essay_id" TEXT NOT NULL,
ALTER COLUMN "thread_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "threads" DROP COLUMN "snippet_end",
DROP COLUMN "snippet_start",
DROP COLUMN "type",
DROP COLUMN "updated_at",
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "end_index" INTEGER NOT NULL,
ADD COLUMN     "start_index" INTEGER NOT NULL,
ALTER COLUMN "snippet_text" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_essay_id_fkey" FOREIGN KEY ("essay_id") REFERENCES "essays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
