const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Auth routes", () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user in the database
    const passwordHash = await bcrypt.hash("password123", 10);
    testUser = await prisma.User.create({
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
    // Clean up test user
    await prisma.User.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  it("POST /auth/login - success", async () => {
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
    const decodedRefresh = jwt.verify(res.body.refreshToken, process.env.JWT_REFRESH_SECRET);
    expect(decodedRefresh).toHaveProperty("userId");
    expect(decodedRefresh.userId).toBe(testUser.id);

    // Optional: check expiration timestamps
    expect(decodedAccess.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(decodedRefresh.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("POST /auth/login - invalid password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("POST /auth/login - invalid email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "notfound@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });
});
