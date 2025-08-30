const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../src/app");
const prisma = require("../../prisma/prisma");
const { generateTestJWT } = require("../helpers/jwt");

describe("Exercise routes", () => {
  let user;
  let authHeader;

  beforeAll(async () => {
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

  afterAll(async () => {
    // Clean up test user and associated data
    await prisma.user.deleteMany({ where: { id: user?.id } });
    await prisma.exercise.deleteMany({ where: { userId: user.id } });
    await prisma.muscleGroup.deleteMany({ where: { userId: user.id } });
    await prisma.$disconnect();
  });

  describe("GET /api/muscle-groups", () => {
    let muscleGroup1;
    let muscleGroup2;

    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/api/muscle-groups");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns an empty array if user has no muscle groups", async () => {
      const res = await request(app)
        .get("/api/muscle-groups")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Muscle Groups successfully retrieved");
      expect(res.body.muscleGroups).toEqual([]);
    });

    it("returns all muscle groups for the authenticated user with exercises", async () => {
      // Create some muscle groups for this user
      muscleGroup1 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Biceps" },
      });
      muscleGroup2 = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Triceps" },
      });

      // Create exercises linked to muscle groups
      const exercise = await prisma.exercise.create({
        data: {
          userId: user.id,
          name: "Bicep Curl",
          description: "Classic bicep exercise",
          muscleGroups: { connect: [{ id: muscleGroup1.id }] },
        },
      });

      const res = await request(app)
        .get("/api/muscle-groups")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Muscle Groups successfully retrieved");
      expect(res.body.muscleGroups.length).toBeGreaterThanOrEqual(2);

      const fetchedMG1 = res.body.muscleGroups.find(
        (mg) => mg.id === muscleGroup1.id,
      );
      const fetchedMG2 = res.body.muscleGroups.find(
        (mg) => mg.id === muscleGroup2.id,
      );

      expect(fetchedMG1).toBeDefined();
      expect(fetchedMG1.exercises.length).toBe(1);
      expect(fetchedMG1.exercises[0].name).toBe("Bicep Curl");

      expect(fetchedMG2).toBeDefined();
      expect(fetchedMG2.exercises.length).toBe(0);
    });
  });

  describe("GET /api/muscle-groups/:muscleGroupId", () => {
    let muscleGroup;

    beforeEach(async () => {
      // Create a muscle group for the test user
      muscleGroup = await prisma.muscleGroup.create({
        data: {
          userId: user.id,
          name: "Chest",
        },
      });
    });

    afterEach(async () => {
      // Clean up any created muscle groups
      await prisma.muscleGroup.deleteMany({ where: { userId: user.id } });
    });

    it("returns 401 if user not authenticated", async () => {
      const res = await request(app).get(`/api/muscle-groups/${muscleGroup.id}`);
      expect(res.status).toBe(401);
    });

    it("returns 400 if muscleGroupId is invalid", async () => {
      const res = await request(app).get("/api/muscle-groups/cat").set(authHeader);
      expect(res.status).toBe(400);
    });

    it("returns 404 if muscle group does not exist", async () => {
      const res = await request(app)
        .get(`/api/muscle-groups/999999`)
        .set(authHeader);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Muscle Group not found");
    });

    it("returns 200 and the muscle group on success", async () => {
      const res = await request(app)
        .get(`/api/muscle-groups/${muscleGroup.id}`)
        .set(authHeader);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Muscle Group successfully retrieved");
      expect(res.body.muscleGroup).toHaveProperty("id", muscleGroup.id);
      expect(res.body.muscleGroup).toHaveProperty("name", "Chest");
      expect(Array.isArray(res.body.muscleGroup.exercises)).toBe(true);
    });
  });

  describe("POST /api/muscle-groups", () => {
    let otherUser;
    let otherAuthHeader;

    beforeAll(async () => {
      // Create a second user for cross-user duplicate name test
      const password = "password456";
      const passwordHash = await bcrypt.hash(password, 10);
      otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1995-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });
      otherAuthHeader = {
        Authorization: "Bearer " + generateTestJWT(otherUser.id),
      };
    });

    afterEach(async () => {
      await prisma.muscleGroup.deleteMany({
        where: { OR: [{ userId: user.id }, { userId: otherUser.id }] },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { id: otherUser.id } });
    });

    it("returns 401 if user not authenticated", async () => {
      const res = await request(app)
        .post("/api/muscle-groups")
        .send({ name: "Legs" });
      expect(res.status).toBe(401);
    });

    it("returns 400 if request body is invalid", async () => {
      const res = await request(app)
        .post("/api/muscle-groups")
        .set(authHeader)
        .send({}); // missing required 'name'
      expect(res.status).toBe(400);
    });

    it("creates a muscle group and returns 201 on success", async () => {
      const res = await request(app)
        .post("/api/muscle-groups")
        .set(authHeader)
        .send({ name: "Back" });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Muscle Group successfully created");
      expect(res.body.muscleGroup).toHaveProperty("id");
      expect(res.body.muscleGroup).toHaveProperty("name", "Back");
      expect(res.body.muscleGroup.userId).toBe(user.id);
      expect(Array.isArray(res.body.muscleGroup.exercises)).toBe(true);

      // Verify persisted in DB
      const inDb = await prisma.muscleGroup.findUnique({
        where: { id: res.body.muscleGroup.id },
      });
      expect(inDb).not.toBeNull();
      expect(inDb.name).toBe("Back");
    });

    it("enforces unique muscle group name per user", async () => {
      // Create one muscle group first
      await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Chest" },
      });

      const res = await request(app)
        .post("/api/muscle-groups")
        .set(authHeader)
        .send({ name: "Chest" });

      expect(res.status).toBe(409);
    });

    it("allows duplicate muscle group names across different users", async () => {
      // User A creates "Arms"
      await request(app)
        .post("/api/muscle-groups")
        .set(authHeader)
        .send({ name: "Arms" })
        .expect(201);

      // User B creates "Arms"
      const res = await request(app)
        .post("/api/muscle-groups")
        .set(otherAuthHeader)
        .send({ name: "Arms" });

      expect(res.status).toBe(201);
      expect(res.body.muscleGroup).toHaveProperty("name", "Arms");
      expect(res.body.muscleGroup.userId).toBe(otherUser.id);
    });
  });

  describe("PATCH /api/muscle-groups/:muscleGroupId", () => {
    let muscleGroup;

    beforeEach(async () => {
      // Create a test muscle group for update scenarios
      muscleGroup = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Shoulders" },
      });
    });

    afterEach(async () => {
      await prisma.muscleGroup.deleteMany({ where: { userId: user.id } });
    });

    it("returns 401 if user not authenticated", async () => {
      const res = await request(app)
        .patch(`/api/muscle-groups/${muscleGroup.id}`)
        .send({ name: "Updated Shoulders" });

      expect(res.status).toBe(401);
    });

    it("returns 400 if params are invalid", async () => {
      const res = await request(app)
        .patch("/api/muscle-groups/not-a-valid-id")
        .set(authHeader)
        .send({ name: "Updated Shoulders" });

      expect(res.status).toBe(400);
    });

    it("returns 400 if body is invalid", async () => {
      const res = await request(app)
        .patch(`/api/muscle-groups/${muscleGroup.id}`)
        .set(authHeader)
        .send({ name: "" }); // invalid name

      expect(res.status).toBe(400);
    });

    it("returns 404 if muscle group does not exist for user", async () => {
      const res = await request(app)
        .patch(`/api/muscle-groups/999999`) // non-existent ID
        .set(authHeader)
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Muscle Group not found");
    });

    it("successfully updates a muscle group", async () => {
      const res = await request(app)
        .patch(`/api/muscle-groups/${muscleGroup.id}`)
        .set(authHeader)
        .send({ name: "Updated Shoulders" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Muscle Group successfully updated");
      expect(res.body.muscleGroup).toHaveProperty("id", muscleGroup.id);
      expect(res.body.muscleGroup).toHaveProperty("name", "Updated Shoulders");
      expect(Array.isArray(res.body.muscleGroup.exercises)).toBe(true);

      // Verify persisted in DB
      const inDb = await prisma.muscleGroup.findUnique({
        where: { id: muscleGroup.id },
      });
      expect(inDb.name).toBe("Updated Shoulders");
    });

    it("does not allow updating another user's muscle group", async () => {
      const password = "password456";
      const passwordHash = await bcrypt.hash(password, 10);
      otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1995-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });
      const otherUserMuscleGroup = await prisma.muscleGroup.create({
        data: { userId: otherUser.id, name: "Other User Group" },
      });

      const res = await request(app)
        .patch(`/api/muscle-groups/${otherUserMuscleGroup.id}`)
        .set(authHeader)
        .send({ name: "Attempted Hack" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Muscle Group not found");

      // Ensure it wasn't updated
      const inDb = await prisma.muscleGroup.findUnique({
        where: { id: otherUserMuscleGroup.id },
      });
      expect(inDb.name).toBe("Other User Group");

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
      await prisma.muscleGroup.deleteMany({ where: { userId: otherUser.id } });
    });
  });

  describe("DELETE /api/muscle-groups/:muscleGroupId", () => {
    let muscleGroup;

    beforeEach(async () => {
      // Create a test muscle group for deletion
      muscleGroup = await prisma.muscleGroup.create({
        data: { userId: user.id, name: "Back" },
      });
    });

    afterEach(async () => {
      await prisma.muscleGroup.deleteMany({ where: { userId: user.id } });
    });

    it("returns 401 if user not authenticated", async () => {
      const res = await request(app).delete(`/api/muscle-groups/${muscleGroup.id}`);
      expect(res.status).toBe(401);
    });

    it("returns 400 if params are invalid", async () => {
      const res = await request(app)
        .delete("/api/muscle-groups/!?<>*&")
        .set(authHeader);

      expect(res.status).toBe(400);
    });

    it("returns 404 if muscle group does not exist for user", async () => {
      const res = await request(app)
        .delete("/api/muscle-groups/999999") // non-existent
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Muscle Group not found");
    });

    it("successfully deletes a muscle group", async () => {
      const res = await request(app)
        .delete(`/api/muscle-groups/${muscleGroup.id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Muscle Group successfully deleted");
      expect(res.body.muscleGroup).toHaveProperty("id", muscleGroup.id);
      expect(res.body.muscleGroup).toHaveProperty("name", "Back");

      // Ensure removed from DB
      const inDb = await prisma.muscleGroup.findUnique({
        where: { id: muscleGroup.id },
      });
      expect(inDb).toBeNull();
    });

    it("does not allow deleting another user's muscle group", async () => {
      const password = "password456";
      const passwordHash = await bcrypt.hash(password, 10);
      otherUser = await prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1995-01-01"),
          heightCm: 175,
          gender: "female",
        },
      });
      const otherUserMuscleGroup = await prisma.muscleGroup.create({
        data: { userId: otherUser.id, name: "Other User Group" },
      });

      const res = await request(app)
        .delete(`/api/muscle-groups/${otherUserMuscleGroup.id}`)
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Muscle Group not found");

      // Ensure still exists in DB
      const inDb = await prisma.muscleGroup.findUnique({
        where: { id: otherUserMuscleGroup.id },
      });
      expect(inDb).not.toBeNull();

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
      await prisma.muscleGroup.deleteMany({ where: { userId: otherUser.id } });
    });
  });
});
