/*
  Warnings:

  - Made the column `finished_at` on table `workout_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."workout_sessions" ALTER COLUMN "finished_at" SET NOT NULL;
