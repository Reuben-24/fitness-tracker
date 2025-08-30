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

  describe("GET /api/workout-sessions", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/api/workout-sessions");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns an empty array if user has no workout sessions", async () => {
      const res = await request(app)
        .get("/api/workout-sessions")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Sessions successfully retrieved");
      expect(res.body.workoutSessions).toEqual([]);
    });

    it("returns all sessions, with sessionExercises, exerciseSets, exercises, and workoutTemplate", async () => {
      // Create a workout template
      const template = await prisma.workoutTemplate.create({
        data: {
          userId: user.id,
          name: "Full Body",
        },
      });

      // Create an exercise
      const exercise = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Squat",
        },
      });

      // Create a workout session linked to template, with exercises and sets
      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date("2025-01-01T10:00:00Z"),
          finishedAt: new Date("2025-01-01T11:00:00Z"),
          sessionExercises: {
            create: [
              {
                exerciseId: exercise.id,
                position: 1,
                exerciseSets: {
                  create: [
                    { setNumber: 1, reps: 10, weight: 100.5, completed: true },
                    { setNumber: 2, reps: 8, weight: 105.0, completed: false },
                  ],
                },
              },
            ],
          },
        },
        include: {
          sessionExercises: { include: { exerciseSets: true, exercise: true } },
          workoutTemplate: true,
        },
      });

      const res = await request(app)
        .get("/api/workout-sessions")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Sessions successfully retrieved");
      expect(res.body.workoutSessions.length).toBeGreaterThanOrEqual(1);

      const fetchedSession = res.body.workoutSessions.find(
        (s) => s.id === session.id,
      );
      expect(fetchedSession).toBeDefined();
      expect(fetchedSession.workoutTemplate.id).toBe(template.id);

      expect(fetchedSession.sessionExercises.length).toBe(1);
      expect(fetchedSession.sessionExercises[0].exercise.id).toBe(exercise.id);

      expect(fetchedSession.sessionExercises[0].exerciseSets.length).toBe(2);
      expect(
        fetchedSession.sessionExercises[0].exerciseSets.map((s) => s.setNumber),
      ).toEqual([1, 2]);
    });
  });

  describe("GET /api/workout-sessions/:workoutSessionId", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/api/workout-sessions/1");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 404 if workout session does not exist", async () => {
      const res = await request(app)
        .get("/api/workout-sessions/999999")
        .set(authHeader)
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");
    });

    it("returns 404 if workout session belongs to another user", async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash: await bcrypt.hash("password123", 10),
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });

      // Create a session for the other user
      const otherSession = await prisma.workoutSession.create({
        data: {
          userId: otherUser.id,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });

      const res = await request(app)
        .get(`/api/workout-sessions/${otherSession.id}`)
        .set(authHeader)
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");

      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it("returns the workout session with exercises, sets, and template for authenticated user", async () => {
      // Create template + exercise
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Leg Day" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Deadlift" },
      });

      // Create workout session
      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date("2025-02-01T09:00:00Z"),
          finishedAt: new Date("2025-02-01T09:45:00Z"),
          sessionExercises: {
            create: [
              {
                exerciseId: exercise.id,
                position: 1,
                exerciseSets: {
                  create: [
                    { setNumber: 1, reps: 5, weight: 120, completed: true },
                    { setNumber: 2, reps: 5, weight: 125, completed: true },
                  ],
                },
              },
            ],
          },
        },
      });

      const res = await request(app)
        .get(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Session successfully retrieved");
      expect(res.body.workoutSession).toBeDefined();
      expect(res.body.workoutSession.id).toBe(session.id);

      const fetchedSession = res.body.workoutSession;
      expect(fetchedSession.workoutTemplate.id).toBe(template.id);
      expect(fetchedSession.sessionExercises.length).toBe(1);
      expect(fetchedSession.sessionExercises[0].exercise.id).toBe(exercise.id);

      expect(
        fetchedSession.sessionExercises[0].exerciseSets.map((s) => s.setNumber),
      ).toEqual([1, 2]);
    });
  });

  describe("POST /workout-sessions", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).post("/api/workout-sessions").send({});
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if body is invalid", async () => {
      const res = await request(app)
        .post("/api/workout-sessions")
        .set(authHeader)
        .send({}) // missing required fields
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it("creates a workout session with exercises and sets for the authenticated user", async () => {
      // Create supporting template + exercise
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Push Day" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Bench Press" },
      });

      const payload = {
        workoutTemplateId: template.id,
        startedAt: "2025-02-10T09:00:00Z",
        finishedAt: "2025-02-10T09:45:00Z",
        sessionExercises: [
          {
            exerciseId: exercise.id,
            position: 1,
            exerciseSets: [
              { setNumber: 1, reps: 10, weight: 60, completed: true },
              { setNumber: 2, reps: 8, weight: 65, completed: true },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/workout-sessions")
        .set(authHeader)
        .send(payload)
        .expect(201);

      expect(res.body.message).toBe("Workout Session successfully created");
      const session = res.body.workoutSession;
      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.workoutTemplate.id).toBe(template.id);

      // Check nested exercises + sets
      expect(session.sessionExercises.length).toBe(1);
      const se = session.sessionExercises[0];
      expect(se.exercise.id).toBe(exercise.id);
      expect(se.exerciseSets.length).toBe(2);
      expect(se.exerciseSets.map((s) => s.setNumber)).toEqual([1, 2]);

      // Double-check in DB
      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
        include: {
          sessionExercises: {
            include: { exerciseSets: true },
          },
        },
      });

      expect(dbSession).not.toBeNull();
      expect(dbSession.userId).toBe(user.id);
      expect(dbSession.sessionExercises.length).toBe(1);

      const dbExercise = dbSession.sessionExercises[0];
      expect(dbExercise.exerciseId).toBe(exercise.id);
      expect(dbExercise.exerciseSets.length).toBe(2);
      expect(dbExercise.exerciseSets.map((s) => s.setNumber)).toEqual([1, 2]);
    });
  });

  describe("PATCH /api/workout-sessions/:workoutSessionId", () => {
    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).patch("/api/workout-sessions/1").send({});
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 404 if workout session does not exist", async () => {
      const res = await request(app)
        .patch("/api/workout-sessions/999999")
        .set(authHeader)
        .send({ finishedAt: "2025-02-10T10:00:00Z" })
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");
    });

    it("returns 404 if workout session belongs to another user", async () => {
      const otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash: await bcrypt.hash("password123", 10),
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });

      const otherSession = await prisma.workoutSession.create({
        data: {
          userId: otherUser.id,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });

      const res = await request(app)
        .patch(`/api/workout-sessions/${otherSession.id}`)
        .set(authHeader)
        .send({ finishedAt: "2025-02-10T10:00:00Z" })
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");

      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it("updates only fields and leaves exercises unchanged", async () => {
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Upper Body" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Overhead Press" },
      });

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date("2025-02-10T09:00:00Z"),
          finishedAt: new Date("2025-02-10T09:45:00Z"),
          sessionExercises: {
            create: [
              {
                exerciseId: exercise.id,
                position: 1,
                exerciseSets: {
                  create: [
                    { setNumber: 1, reps: 8, weight: 40, completed: true },
                  ],
                },
              },
            ],
          },
        },
      });

      const res = await request(app)
        .patch(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .send({ finishedAt: "2025-02-10T10:00:00Z" })
        .expect(200);

      expect(res.body.message).toBe("Workout Session successfully updated");
      expect(new Date(res.body.workoutSession.finishedAt).toISOString()).toBe(
        "2025-02-10T10:00:00.000Z",
      );
      expect(res.body.workoutSession.sessionExercises.length).toBe(1);
    });

    it("clears sessionExercises when empty array is sent", async () => {
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Leg Day" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Squat" },
      });

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date(),
          finishedAt: new Date(),
          sessionExercises: {
            create: [
              {
                exerciseId: exercise.id,
                position: 1,
                exerciseSets: {
                  create: [
                    { setNumber: 1, reps: 10, weight: 100, completed: true },
                  ],
                },
              },
            ],
          },
        },
      });

      const res = await request(app)
        .patch(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .send({ sessionExercises: [] })
        .expect(200);

      expect(res.body.workoutSession.sessionExercises).toHaveLength(0);

      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
        include: { sessionExercises: true },
      });
      expect(dbSession.sessionExercises).toHaveLength(0);
    });

    it("replaces sessionExercises when valid array is sent", async () => {
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Chest Day" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Bench Press" },
      });

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });

      const res = await request(app)
        .patch(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .send({
          sessionExercises: [
            {
              exerciseId: exercise.id,
              position: 1,
              exerciseSets: [
                { setNumber: 1, reps: 12, weight: 60, completed: true },
              ],
            },
          ],
        })
        .expect(200);

      expect(res.body.workoutSession.sessionExercises).toHaveLength(1);
      expect(
        res.body.workoutSession.sessionExercises[0].exerciseSets,
      ).toHaveLength(1);

      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
        include: {
          sessionExercises: { include: { exerciseSets: true } },
        },
      });

      expect(dbSession.sessionExercises).toHaveLength(1);
      expect(dbSession.sessionExercises[0].exerciseSets).toHaveLength(1);
    });

    it("clears exerciseSets when an empty array is sent for an exercise", async () => {
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Arms Day" },
      });

      const exercise = await prisma.exercise.create({
        data: { userId: user.id, name: "Bicep Curl" },
      });

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date(),
          finishedAt: new Date(),
          sessionExercises: {
            create: [
              {
                exerciseId: exercise.id,
                position: 1,
                exerciseSets: {
                  create: [
                    { setNumber: 1, reps: 10, weight: 15, completed: true },
                    { setNumber: 2, reps: 8, weight: 17.5, completed: true },
                  ],
                },
              },
            ],
          },
        },
      });

      const res = await request(app)
        .patch(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .send({
          sessionExercises: [
            {
              exerciseId: exercise.id,
              position: 1,
              exerciseSets: [],
            },
          ],
        })
        .expect(200);

      expect(res.body.workoutSession.sessionExercises).toHaveLength(1);
      expect(
        res.body.workoutSession.sessionExercises[0].exerciseSets,
      ).toHaveLength(0);

      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
        include: {
          sessionExercises: { include: { exerciseSets: true } },
        },
      });

      expect(dbSession.sessionExercises).toHaveLength(1);
      expect(dbSession.sessionExercises[0].exerciseSets).toHaveLength(0);
    });
  });

  describe("DELETE /api/workout-sessions/:workoutSessionId", () => {
    it("deletes a workout session successfully and returns it", async () => {
      const template = await prisma.workoutTemplate.create({
        data: { userId: user.id, name: "Delete Test Template" },
      });

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTemplateId: template.id,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });

      const res = await request(app)
        .delete(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Workout Session successfully deleted");
      expect(res.body.workoutSession.id).toBe(session.id);

      // Check DB: session should be gone
      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
      });
      expect(dbSession).toBeNull();
    });

    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).delete("/api/workout-sessions/1");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 if workoutTemplateId is invalid", async () => {
      const res = await request(app)
        .delete("/api/workout-sessions/invalid-id")
        .set(authHeader);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("returns 404 if the workout session does not exist", async () => {
      const res = await request(app)
        .delete(`/api/workout-sessions/999999`)
        .set(authHeader)
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");
    });

    it("returns 404 if the workout session belongs to another user", async () => {
      // Create a second user
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      const otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1992-07-14"),
          heightCm: 180,
          gender: "male",
        },
      });
      const template = await prisma.workoutTemplate.create({
        data: { userId: otherUser.id, name: "Other User Template" },
      });
      const session = await prisma.workoutSession.create({
        data: {
          userId: otherUser.id,
          workoutTemplateId: template.id,
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });

      const res = await request(app)
        .delete(`/api/workout-sessions/${session.id}`)
        .set(authHeader)
        .expect(404);

      expect(res.body.error).toBe("Workout Session not found");

      // DB should still contain the session
      const dbSession = await prisma.workoutSession.findUnique({
        where: { id: session.id },
      });
      expect(dbSession).not.toBeNull();

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
