const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../src/app");
const prisma = require("../../prisma/prisma");
const { generateTestJWT } = require("../helpers/jwt");

describe("Workout Template routes", () => {
  let user;
  let authHeader;

  beforeEach(async () => {
    // Create a test user with auth
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
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
    authHeader = { Authorization: "Bearer " + generateTestJWT(user.id) };
  });

  afterEach(async () => {
    // Clean up test user
    await prisma.user.deleteMany({ where: { id: user?.id } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/workout-templates", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/api/muscle-groups");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns an empty array if user has no workout templates", async () => {
      const res = await request(app)
        .get("/api/muscle-groups")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Muscle Groups successfully retrieved");
      expect(res.body.muscleGroups).toEqual([]);
    });

    it("returns all templates, exercises and muscle groups for authenticated user", async () => {
      // Create muscle groups
      const mg1 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Chest" },
      });
      const mg2 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Back" },
      });

      // Create exercises linked to muscle groups
      const ex1 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bench Press",
          muscleGroups: { connect: [{ id: mg1.id }] },
        },
      });
      const ex2 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Pull Up",
          muscleGroups: { connect: [{ id: mg2.id }] },
        },
      });

      // Create workout template with template exercises
      const template = await prisma.workoutTemplate.create({
        data: {
          userId: user.id,
          name: "Upper Body",
          templateExercises: {
            create: [
              { exerciseId: ex1.id, sets: 3, reps: 10, position: 1 },
              { exerciseId: ex2.id, sets: 3, reps: 8, position: 2 },
            ],
          },
        },
        include: { templateExercises: true },
      });

      const res = await request(app)
        .get("/api/workout-templates")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Templates successfully retrieved");
      expect(res.body.workoutTemplates.length).toBeGreaterThanOrEqual(1);

      const fetchedTemplate = res.body.workoutTemplates.find(
        (t) => t.id === template.id,
      );
      expect(fetchedTemplate).toBeDefined();
      expect(fetchedTemplate.templateExercises.length).toBe(2);

      const fetchedEx1 = fetchedTemplate.templateExercises.find(
        (te) => te.exercise.id === ex1.id,
      );
      const fetchedEx2 = fetchedTemplate.templateExercises.find(
        (te) => te.exercise.id === ex2.id,
      );

      expect(fetchedEx1.exercise.muscleGroups.map((mg) => mg.name)).toContain(
        "Chest",
      );
      expect(fetchedEx2.exercise.muscleGroups.map((mg) => mg.name)).toContain(
        "Back",
      );
    });
  });

  describe("GET /api/workout-templates/:workoutTemplateId", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/api/workout-templates/1");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if workoutTemplateId is invalid", async () => {
      const res = await request(app)
        .get("/api/workout-templates/cat")
        .set(authHeader);
      expect(res.status).toBe(400);
    });

    it("returns 404 if the workout template does not exist", async () => {
      const res = await request(app)
        .get("/api/workout-templates/999999")
        .set(authHeader)
        .expect(404);

      expect(res.body.error).toBe("Workout Template not found");
    });

    it("returns the workout template with its exercises and muscle groups for a valid ID", async () => {
      // Create muscle groups
      const mg1 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Chest" },
      });
      const mg2 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Back" },
      });

      // Create exercises
      const ex1 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bench Press",
          muscleGroups: { connect: [{ id: mg1.id }] },
        },
      });
      const ex2 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Pull Up",
          muscleGroups: { connect: [{ id: mg2.id }] },
        },
      });

      // Create workout template
      const template = await prisma.workoutTemplate.create({
        data: {
          userId: user.id,
          name: "Upper Body",
          templateExercises: {
            create: [
              { exerciseId: ex1.id, sets: 3, reps: 10, position: 1 },
              { exerciseId: ex2.id, sets: 3, reps: 8, position: 2 },
            ],
          },
        },
        include: { templateExercises: true },
      });

      const res = await request(app)
        .get(`/api/workout-templates/${template.id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Workout Template successfully retrieved");
      expect(res.body.workoutTemplate.id).toBe(template.id);
      expect(res.body.workoutTemplate.templateExercises.length).toBe(2);

      const te1 = res.body.workoutTemplate.templateExercises.find(
        (te) => te.exercise.id === ex1.id,
      );
      const te2 = res.body.workoutTemplate.templateExercises.find(
        (te) => te.exercise.id === ex2.id,
      );

      expect(te1.exercise.muscleGroups.map((mg) => mg.name)).toContain("Chest");
      expect(te2.exercise.muscleGroups.map((mg) => mg.name)).toContain("Back");
    });
  });

  describe("POST /api/workout-templates", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app)
        .post("/api/workout-templates")
        .send({ name: "Upper Body", templateExercises: [] });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if required fields are missing or invalid", async () => {
      // Missing name
      let res = await request(app)
        .post("/api/workout-templates")
        .set(authHeader)
        .send({ templateExercises: [] });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();

      // Invalid templateExercises (not an array)
      res = await request(app)
        .post("/api/workout-templates")
        .set(authHeader)
        .send({ name: "Upper Body", templateExercises: "not-an-array" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("creates a workout template with exercises and returns the full structure", async () => {
      // Create some exercises and muscle groups first
      const mg1 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Chest" },
      });
      const mg2 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Back" },
      });

      const ex1 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bench Press",
          muscleGroups: { connect: [{ id: mg1.id }] },
        },
      });
      const ex2 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Pull Up",
          muscleGroups: { connect: [{ id: mg2.id }] },
        },
      });

      const payload = {
        name: "Upper Body",
        templateExercises: [
          { exerciseId: ex1.id, sets: 3, reps: 10, position: 1 },
          { exerciseId: ex2.id, sets: 3, reps: 8, position: 2 },
        ],
      };

      const res = await request(app)
        .post("/api/workout-templates")
        .set(authHeader)
        .send(payload)
        .expect(201);

      expect(res.body.message).toBe("Workout Template successfully created");
      expect(res.body.workoutTemplate.name).toBe("Upper Body");
      expect(res.body.workoutTemplate.templateExercises.length).toBe(2);

      const te1 = res.body.workoutTemplate.templateExercises.find(
        (te) => te.exercise.id === ex1.id,
      );
      const te2 = res.body.workoutTemplate.templateExercises.find(
        (te) => te.exercise.id === ex2.id,
      );

      expect(te1.exercise.muscleGroups.map((mg) => mg.name)).toContain("Chest");
      expect(te2.exercise.muscleGroups.map((mg) => mg.name)).toContain("Back");
    });

    it("enforces unique template name per user", async () => {
      const payload = { name: "Full Body", templateExercises: [] };

      // Create first template
      await request(app)
        .post("/api/workout-templates")
        .set(authHeader)
        .send(payload)
        .expect(201);

      // Attempt to create another template with the same name for the same user
      const res = await request(app)
        .post("/api/workout-templates")
        .set(authHeader)
        .send(payload);

      expect(res.status).toBe(409); // Conflict due to unique constraint
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("allows duplicate template names across different users", async () => {
      // Create a second user
      const passwordHash = await bcrypt.hash("password123", 10);
      const user2 = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });
      const authHeader2 = {
        Authorization: "Bearer " + generateTestJWT(user2.id),
      };

      const payload = { name: "Full Body", templateExercises: [] };

      // Should succeed for the second user
      const res = await request(app)
        .post("/api/workout-templates")
        .set(authHeader2)
        .send(payload)
        .expect(201);

      expect(res.body.workoutTemplate.name).toBe("Full Body");

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe("PATCH /api/workout-templates/:workoutTemplateId", () => {
    let template, ex1, ex2;

    beforeEach(async () => {
      // Create muscle groups
      const mg = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Chest" },
      });
      // Create exercises
      ex1 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bench Press",
          muscleGroups: { connect: [{ id: mg.id }] },
        },
      });
      ex2 = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Push Up",
          muscleGroups: { connect: [{ id: mg.id }] },
        },
      });
      // Create workout template with one exercise
      template = await prisma.workoutTemplate.create({
        data: {
          userId: user.id,
          name: "Upper Body",
          templateExercises: {
            create: [{ exerciseId: ex1.id, sets: 3, reps: 10, position: 1 }],
          },
        },
        include: { templateExercises: true },
      });
    });

    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app)
        .patch("/api/workout-templates/1")
        .send({ name: "Updated" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if workoutTemplateId is invalid", async () => {
      const res = await request(app)
        .patch("/api/workout-templates/not-a-number")
        .set(authHeader)
        .send({ name: "Updated" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("returns 404 if the workout template does not exist for this user", async () => {
      const res = await request(app)
        .patch("/api/workout-templates/999999")
        .set(authHeader)
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Workout Template not found");
    });

    it("returns 400 if the payload is invalid", async () => {
      // First create a template to update
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Old Name" },
      });

      // Invalid sets (must be positive integer)
      const res = await request(app)
        .patch(`/api/workout-templates/${template.id}`)
        .set(authHeader)
        .send({
          templateExercises: [
            { exerciseId: 1, sets: "not-an-int", reps: 10, position: 1 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("omitting templateExercises leaves existing exercises unchanged", async () => {
      const payload = { name: "Upper Body Updated" };

      const res = await request(app)
        .patch(`/api/workout-templates/${template.id}`)
        .set(authHeader)
        .send(payload)
        .expect(200);

      expect(res.body.workoutTemplate.name).toBe("Upper Body Updated");
      expect(res.body.workoutTemplate.templateExercises.length).toBe(1);
      expect(res.body.workoutTemplate.templateExercises[0].exerciseId).toBe(
        ex1.id,
      );
    });

    it("sending templateExercises: [] clears all exercises", async () => {
      const payload = { templateExercises: [] };

      const res = await request(app)
        .patch(`/api/workout-templates/${template.id}`)
        .set(authHeader)
        .send(payload)
        .expect(200);

      expect(res.body.workoutTemplate.templateExercises.length).toBe(0);
    });

    it("sending a new set of templateExercises replaces existing ones", async () => {
      const payload = {
        templateExercises: [
          { exerciseId: ex2.id, sets: 4, reps: 12, position: 1 },
        ],
      };

      const res = await request(app)
        .patch(`/api/workout-templates/${template.id}`)
        .set(authHeader)
        .send(payload)
        .expect(200);

      expect(res.body.workoutTemplate.templateExercises.length).toBe(1);
      expect(res.body.workoutTemplate.templateExercises[0].exerciseId).toBe(
        ex2.id,
      );
      expect(res.body.workoutTemplate.templateExercises[0].sets).toBe(4);
      expect(res.body.workoutTemplate.templateExercises[0].reps).toBe(12);
    });
  });

  describe("DELETE /api/workout-templates/:workoutTemplateId", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).delete("/api/workout-templates/1");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if workoutTemplateId is invalid", async () => {
      const res = await request(app)
        .delete("/api/workout-templates/invalid-id")
        .set(authHeader);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("returns 404 if the workout template does not exist for the user", async () => {
      const res = await request(app)
        .delete("/api/workout-templates/999999")
        .set(authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Workout Template not found");
    });

    it("successfully deletes a workout template and returns it", async () => {
      // Create a workout template for the user
      const ex = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bench Press",
        },
      });
      const template = await prisma.workoutTemplate.create({
        data: {
          userId: user.id,
          name: "To Be Deleted",
          templateExercises: {
            create: [{ exerciseId: ex.id, sets: 3, reps: 10, position: 1 }],
          },
        },
        include: { templateExercises: true },
      });

      const res = await request(app)
        .delete(`/api/workout-templates/${template.id}`)
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Template successfully deleted");
      expect(res.body.workoutTemplate.id).toBe(template.id);
      expect(res.body.workoutTemplate.name).toBe("To Be Deleted");

      // Verify it was actually deleted
      const check = await prisma.workoutTemplate.findUnique({
        where: { id: template.id },
      });
      expect(check).toBeNull();
    });

    it("does not allow a user to delete another user's template", async () => {
      // Create a second user
      const passwordHash = await bcrypt.hash("password123", 10);
      const otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });
      const template = await prisma.workoutTemplate.create({
        data: { userId: otherUser.id, name: "Other's Template" },
      });

      const res = await request(app)
        .delete(`/api/workout-templates/${template.id}`)
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Workout Template not found");

      // Clean up
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
