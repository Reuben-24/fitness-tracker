const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Auth routes", () => {
  describe("POST /auth/login", () => {
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
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("refreshToken");

      // Verify the access token
      const decodedAccess = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decodedAccess).toHaveProperty("userId");
      expect(decodedAccess.userId).toBe(testUser.id); // Optional: match the test user ID

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
        .post("/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid credentials" });
    });

    it("Handles invalid email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "notfound@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid credentials" });
    });
  });

  describe("POST /auth/logout", () => {
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

      // Login to get a refresh token
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "logout@test.com", password: "password123" });

      refreshToken = res.body.refreshToken;
    });

    afterAll(async () => {
      // Clean up user and tokens
      await prisma.refreshToken.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
      await prisma.$disconnect();
    });

    it("should delete the refresh token and return success", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Logged out successfully" });
    });

    it("should fail if token is already deleted or invalid", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token not found" });
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/auth/logout").send({});

      expect(res.status).toBe(400); // Or match your validation error
      expect(res.body).toHaveProperty("errors"); // Depends on your validation middleware
    });
  });

  describe("POST /auth/refresh-token", () => {
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

      // Login to get a refresh token
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "refresh@test.com", password: "password123" });

      refreshToken = res.body.refreshToken;
    });

    afterAll(async () => {
      // Clean up user and tokens
      await prisma.refreshToken.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
      await prisma.$disconnect();
    });

    it("should return a new access token with a valid refresh token", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
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
        .post("/auth/refresh-token")
        .send({ refreshToken: "invalidtoken" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid refresh token" });
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/auth/refresh-token").send({});

      expect(res.status).toBe(400); // or match your validation middleware
      expect(res.body).toHaveProperty("errors"); // depends on your validator
    });
  });
});
