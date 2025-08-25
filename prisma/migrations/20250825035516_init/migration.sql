-- CreateEnum
CREATE TYPE "public"."user_gender" AS ENUM ('male', 'female', 'non-binary', 'prefer not to say');

-- CreateTable
CREATE TABLE "public"."body_weights" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "recorded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "body_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercise_muscle_groups" (
    "exercise_id" INTEGER NOT NULL,
    "muscle_group_id" INTEGER NOT NULL,

    CONSTRAINT "exercise_muscle_groups_pkey" PRIMARY KEY ("exercise_id","muscle_group_id")
);

-- CreateTable
CREATE TABLE "public"."exercise_sets" (
    "id" SERIAL NOT NULL,
    "session_exercise_id" INTEGER NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER,
    "weight" DECIMAL(5,2),
    "completed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercises" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "equipment" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."muscle_groups" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muscle_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_exercises" (
    "id" SERIAL NOT NULL,
    "workout_session_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."template_exercises" (
    "id" SERIAL NOT NULL,
    "workout_template_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DECIMAL(5,2),
    "position" INTEGER NOT NULL,

    CONSTRAINT "template_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "height_cm" INTEGER NOT NULL,
    "gender" "public"."user_gender" NOT NULL DEFAULT 'prefer not to say',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workout_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "workout_template_id" INTEGER,
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workout_templates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_body_weights_user_id_recorded_at" ON "public"."body_weights"("user_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_exercise_muscle_groups_exercise_id" ON "public"."exercise_muscle_groups"("exercise_id");

-- CreateIndex
CREATE INDEX "idx_exercise_muscle_groups_muscle_group_id" ON "public"."exercise_muscle_groups"("muscle_group_id");

-- CreateIndex
CREATE INDEX "idx_exercise_sets_session_exercise_id" ON "public"."exercise_sets"("session_exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_user_id_name_key" ON "public"."exercises"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "muscle_groups_name_key" ON "public"."muscle_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "muscle_groups_user_id_name_key" ON "public"."muscle_groups"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "public"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_session_exercises_exercise_id" ON "public"."session_exercises"("exercise_id");

-- CreateIndex
CREATE INDEX "idx_session_exercises_session_id" ON "public"."session_exercises"("workout_session_id");

-- CreateIndex
CREATE INDEX "idx_template_exercises_exercise_id" ON "public"."template_exercises"("exercise_id");

-- CreateIndex
CREATE INDEX "idx_template_exercises_template_id" ON "public"."template_exercises"("workout_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_exercises_workout_template_id_position_key" ON "public"."template_exercises"("workout_template_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_workout_sessions_started_at" ON "public"."workout_sessions"("started_at");

-- CreateIndex
CREATE INDEX "idx_workout_sessions_user_id" ON "public"."workout_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_workout_templates_user_id" ON "public"."workout_templates"("user_id");

-- AddForeignKey
ALTER TABLE "public"."body_weights" ADD CONSTRAINT "body_weights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."exercise_muscle_groups" ADD CONSTRAINT "exercise_muscle_groups_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."exercise_muscle_groups" ADD CONSTRAINT "exercise_muscle_groups_muscle_group_id_fkey" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."exercise_sets" ADD CONSTRAINT "exercise_sets_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."exercises" ADD CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."muscle_groups" ADD CONSTRAINT "muscle_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."session_exercises" ADD CONSTRAINT "session_exercises_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."template_exercises" ADD CONSTRAINT "template_exercises_workout_template_id_fkey" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workout_sessions" ADD CONSTRAINT "workout_sessions_workout_template_id_fkey" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workout_templates" ADD CONSTRAINT "workout_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
