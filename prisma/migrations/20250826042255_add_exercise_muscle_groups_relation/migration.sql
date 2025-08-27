-- CreateTable
CREATE TABLE "public"."_ExerciseToMuscleGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExerciseToMuscleGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExerciseToMuscleGroup_B_index" ON "public"."_ExerciseToMuscleGroup"("B");

-- AddForeignKey
ALTER TABLE "public"."_ExerciseToMuscleGroup" ADD CONSTRAINT "_ExerciseToMuscleGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExerciseToMuscleGroup" ADD CONSTRAINT "_ExerciseToMuscleGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."muscle_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
