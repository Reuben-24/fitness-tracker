const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const prisma = require("../prisma/prisma");
const generateTestJWT = require("./helpers/jwt");

describe("Exercise routes", () => {
  let user;
  let authHeader;

  beforeAll(async () => {
    // Create a test user with auth
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
    authHeader = { Authorization: "Bearer " + generateTestJWT(user.id) };
  });

  afterAll(async () => {
    // Clean up test user and associated data
    await prisma.User.deleteMany({ where: { id: user?.id } });
    await prisma.$disconnect();
    await prisma.Exercise.deleteMany({ where: { userId: user.id } });
    await prisma.MuscleGroup.deleteMany({ where: { userId: user.id } });
  });

  describe("GET /muscleGroups", () => {
    let muscleGroup1;
    let muscleGroup2;

    it("returns 401 if user is unauthenticated", async () => {
      const res = await request(app).get("/muscleGroups");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns an empty array if user has no muscle groups", async () => {
      const res = await request(app)
        .get("/muscleGroups")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Muscle Groups successfully retrieved");
      expect(res.body.muscleGroups).toEqual([]);
    });

    it("returns all muscle groups for the authenticated user with exercises", async () => {
      // Create some muscle groups for this user
      muscleGroup1 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: "Biceps" },
      });
      muscleGroup2 = await prisma.MuscleGroup.create({
        data: { userId: user.id, name: "Triceps" },
      });

      // Create exercises linked to muscle groups
      const exercise = await prisma.Exercise.create({
        data: {
          userId: user.id,
          name: "Bicep Curl",
          description: "Classic bicep exercise",
          muscleGroups: { connect: [{ id: muscleGroup1.id }] },
        },
      });

      const res = await request(app)
        .get("/muscleGroups")
        .set(authHeader)
        .expect(200);

      expect(res.body.message).toBe("Muscle Groups successfully retrieved");
      expect(res.body.muscleGroups.length).toBeGreaterThanOrEqual(2);

      const fetchedMG1 = res.body.muscleGroups.find(
        (mg) => mg.id === muscleGroup1.id
      );
      const fetchedMG2 = res.body.muscleGroups.find(
        (mg) => mg.id === muscleGroup2.id
      );

      expect(fetchedMG1).toBeDefined();
      expect(fetchedMG1.exercises.length).toBe(1);
      expect(fetchedMG1.exercises[0].name).toBe("Bicep Curl");

      expect(fetchedMG2).toBeDefined();
      expect(fetchedMG2.exercises.length).toBe(0);
    });
  });
});
