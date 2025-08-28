/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `workout_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workout_templates_user_id_name_key" ON "public"."workout_templates"("user_id", "name");
