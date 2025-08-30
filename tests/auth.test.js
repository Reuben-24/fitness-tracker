const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createTestRefreshJWT } = require("./helpers/jwt");

describe("Auth routes", () => {
  describe("POST /api/auth/login", () => {
    let testUser;

    beforeAll(async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash("password123", 10);
      testUser = await prisma.user.create({
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
    });

    afterAll(async () => {
      // Clean up user and tokens
      await prisma.refreshToken.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
      await prisma.$disconnect();
    });

    it("Correctly handles happy path", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("refreshToken");

      // Verify the access token
      const decodedAccess = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decodedAccess).toHaveProperty("userId");
      expect(decodedAccess.userId).toBe(testUser.id);

      // Verify the refresh token
      const decodedRefresh = jwt.verify(
        res.body.refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );
      expect(decodedRefresh).toHaveProperty("userId");
      expect(decodedRefresh.userId).toBe(testUser.id);

      // Check expiration timestamps
      expect(decodedAccess.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(decodedRefresh.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("Handles invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid credentials" });
    });

    it("Handles invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "notfound@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid credentials" });
    });
  });

  describe("POST /api/auth/logout", () => {
    let testUser;
    let refreshToken;

    beforeAll(async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash("password123", 10);
      testUser = await prisma.user.create({
        data: {
          firstName: "Logout",
          lastName: "Tester",
          email: "logout@test.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        },
      });
      refreshToken = await createTestRefreshJWT(testUser.id);
    });

    afterAll(async () => {
      // Clean up
      await prisma.user.deleteMany({ where: { id: testUser.id } });
      await prisma.$disconnect();
    });

    it("should delete the refresh token and return success", async () => {
      console.log(refreshToken);
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Logged out successfully" });
    });

    it("should fail if token is already deleted or invalid", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token not found" });
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/logout").send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    let testUser;
    let refreshToken;

    beforeAll(async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash("password123", 10);
      testUser = await prisma.user.create({
        data: {
          firstName: "Refresh",
          lastName: "Tester",
          email: "refresh@test.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        },
      });
      refreshToken = await createTestRefreshJWT(testUser.id);
    });

    afterAll(async () => {
      // Clean up
      await prisma.user.deleteMany({ where: { id: testUser.id } });
      await prisma.$disconnect();
    });

    it("should return a new access token with a valid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("refreshToken");

      // Verify new access token
      const decodedAccess = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decodedAccess.userId).toBe(testUser.id);

      // Verify refresh token stays the same
      expect(res.body.refreshToken).toBe(refreshToken);
    });

    it("should fail with an invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalidtoken" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid or expired token" });
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh-token").send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
