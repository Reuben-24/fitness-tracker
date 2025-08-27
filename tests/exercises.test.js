const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const prisma = require("../prisma/prisma");
const generateTestJWT = require("./helpers/jwt");

describe("Exercise routes", () => {
  let token;
  let user;
  let exercise;

  // Before all tests, create a test user
  beforeAll(async () => {
    // Create a test user
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.User.create({
      data: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        passwordHash,
        birthDate: new Date("1992-07-14"),
        heightCm: 180,
        gender: "male",
      },
    });

    // Generate auth token
    token = "Bearer " + generateTestJWT(user.id);
  });

  // After all tests, clean up
  afterAll(async () => {
    await prisma.User.deleteMany({ where: { id: user?.id } });
    await prisma.exerciseMuscleGroup.deleteMany({
      where: { exerciseId: exercise?.id },
    });
    await prisma.Exercise.deleteMany({ where: { userId: user?.id } });
    await prisma.$disconnect();
  });

  describe("GET /exercises", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app)
        .get("/exercises")
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it("returns an empty array if user has no exercises", async () => {
      const res = await request(app)
        .get("/exercises")
        .set("Authorization", token)
        .expect(200);

      expect(res.body.exercises).toEqual([]);
      expect(res.body.message).toBe("Exercises successfully retrieved");
    });

    it("returns exercises for the authenticated user with muscle groups", async () => {
      // Create some muscle groups
      const muscleGroup1 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: "Biceps" },
      });
      const muscleGroup2 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: "Triceps" },
      });

      // Create exercises linked to muscle groups
      exercise = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: "Bicep Curl",
          description: "Classic bicep exercise",
          muscleGroups: {
            connect: [{ id: muscleGroup1.id }, { id: muscleGroup2.id }],
          },
        },
      });

      const res = await request(app)
        .get("/exercises")
        .set("Authorization", token)
        .expect(200);

      expect(res.body.message).toBe("Exercises successfully retrieved");
      expect(res.body.exercises.length).toBeGreaterThanOrEqual(1);

      const fetchedExercise = res.body.exercises.find(
        (ex) => ex.id === exercise.id
      );
      expect(fetchedExercise).toBeDefined();
      expect(fetchedExercise.muscleGroups.length).toBe(2);
      expect(fetchedExercise.muscleGroups.map((mg) => mg.name)).toEqual(
        expect.arrayContaining(["Biceps", "Triceps"])
      );
    });
  });

  describe("GET /exercises/exerciseId", () => {
    it("should return 400 if exerciseId is not a number", async () => {
      const res = await request(app)
        .get("/exercises/cat")
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 404 if no exercise with that ID exists for the user", async () => {
      const res = await request(app)
        .get("/exercises/999999")
        .set("Authorization", token);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Exercise not found" });
    });

    it("should return 200 and the exercise with muscle groups", async () => {
      // Create exercise and muscle groups
      const mg1 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Biceps-${Date.now()}` },
      });
      const mg2 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Triceps-${Date.now()}` },
      });

      exercise = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: "Hammer Curl",
          description: "Classic bicep exercise",
          equipment: "Dumbells",
          muscleGroups: {
            connect: [
              { id: mg1.id },
              { id: mg2.id },
            ],
          },
        },
        include: { muscleGroups: true },
      });

      const res = await request(app)
        .get(`/exercises/${exercise.id}`)
        .set("Authorization", token);

      console.log(res.body)

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Exercise successfully retrieved");
      expect(res.body).toHaveProperty("exercise");
      expect(res.body.exercise.id).toBe(exercise.id);
      expect(Array.isArray(res.body.exercise.muscleGroups)).toBe(true);
      expect(res.body.exercise.muscleGroups.length).toBe(2);
      expect(res.body.exercise.muscleGroups[0]).toHaveProperty("name");
    });
  });

  describe("POST /exercises", () => {
    it("should return 401 if user is unauthenticated", async () => {
      const res = await request(app)
        .post("/exercises")
        .send({ name: "Push Up" });
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/exercises")
        .set("Authorization", token)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("should create an exercise without muscle groups", async () => {
      const res = await request(app)
        .post("/exercises")
        .set("Authorization", token)
        .send({
          name: "Push Up",
          description: "Bodyweight chest exercise",
          equipment: "None",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Exercise successfully created");
      expect(res.body.exercise).toHaveProperty("id");
      expect(res.body.exercise.muscleGroups).toEqual([]);
    });

    it("should create an exercise with muscle groups", async () => {
      // Create muscle groups first
      const chest = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Chest-${Date.now()}` },
      });
      const triceps = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Triceps-${Date.now()}` },
      });

      const res = await request(app)
        .post("/exercises")
        .set("Authorization", token)
        .send({
          name: "Bench Press",
          description: "Barbell chest press",
          equipment: "Barbell",
          muscleGroupIds: [chest.id, triceps.id],
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Exercise successfully created");
      expect(res.body.exercise.name).toBe("Bench Press");
      expect(res.body.exercise.muscleGroups.length).toBe(2);
      expect(res.body.exercise.muscleGroups.map((mg) => mg.name)).toEqual(
        expect.arrayContaining([chest.name, triceps.name])
      );
    });
  });

  describe("PATCH /exercises/:exerciseId", () => {
    it("should return 400 if exerciseId is not a number", async () => {
      const res = await request(app)
        .patch("/exercises/cat")
        .set("Authorization", token)
        .send({ name: "Updated Name" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 404 if exercise does not exist for the user", async () => {
      const res = await request(app)
        .patch("/exercises/999999")
        .set("Authorization", token)
        .send({ name: "Updated Name" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Exercise not found" });
    });

    it("should update an exercise’s basic fields (without muscle groups)", async () => {
      // Create exercise
      const exerciseToUpdate = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: `Push Up-1`,
          description: "Basic push up",
        },
      });

      const res = await request(app)
        .patch(`/exercises/${exerciseToUpdate.id}`)
        .set("Authorization", token)
        .send({ name: "Updated Push Up", description: "Modified description" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Exercise successfully updated");
      expect(res.body.exercise.id).toBe(exerciseToUpdate.id);
      expect(res.body.exercise.name).toBe("Updated Push Up");
      expect(res.body.exercise.description).toBe("Modified description");
    });

    it("should update exercise and set new muscle groups", async () => {
      // Create exercise and initial muscle group
      const mg1 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Chest-${Date.now()}` },
      });
      const mg2 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Shoulders-${Date.now()}` },
      });
      const mg3 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: `Back-${Date.now()}` },
      });

      const exerciseToUpdate = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: `Bench Press 1`,
          description: "Chest exercise",
          muscleGroups: { connect: [{ id: mg1.id }] },
        },
        include: { muscleGroups: true },
      });

      // Update to new muscle groups (mg2, mg3 only)
      const res = await request(app)
        .patch(`/exercises/${exerciseToUpdate.id}`)
        .set("Authorization", token)
        .send({
          name: "Incline Bench Press",
          muscleGroupIds: [mg2.id, mg3.id],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Exercise successfully updated");
      expect(res.body.exercise.id).toBe(exerciseToUpdate.id);
      expect(res.body.exercise.name).toBe("Incline Bench Press");

      const returnedMuscleGroups = res.body.exercise.muscleGroups.map(
        (mg) => mg.name
      );
      expect(returnedMuscleGroups).toEqual(
        expect.arrayContaining([mg2.name, mg3.name])
      );
      expect(returnedMuscleGroups).not.toContain(mg1.name);
    });
  });

  describe("DELETE /exercises/:exerciseId", () => {
    it("should return 400 for invalid exerciseId param", async () => {
      const res = await request(app)
        .delete("/exercises/not-a-number")
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 404 if exercise not found", async () => {
      const res = await request(app)
        .delete(`/exercises/999999`) // ID that doesn't exist
        .set("Authorization", token);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Exercise not found");
    });

    it("should delete an exercise successfully", async () => {
      // Create an exercise to delete
      const exerciseToDelete = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: `Delete Me-${Date.now()}`,
          description: "Temp exercise for deletion",
        },
      });

      const res = await request(app)
        .delete(`/exercises/${exerciseToDelete.id}`)
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Exercise successfully deleted"
      );
      expect(res.body.exercise.id).toBe(exerciseToDelete.id);

      // Ensure it is actually deleted
      const check = await prisma.Exercise.findUnique({
        where: { id: exerciseToDelete.id },
      });
      expect(check).toBeNull();
    });
  });
});
