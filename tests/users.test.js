const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");

describe("Users routes", () => {
  describe("POST /users", () => {
    afterAll(async () => {
      await prisma.User.deleteMany();
      await prisma.$disconnect();
    });

    it("should create a user successfully (happy path)", async () => {
      const res = await request(app)
        .post("/users")
        .send({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "password123",
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe("john.doe@example.com");

      // Save for cleanup + reuse
      createdUser = res.body.user;
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app).post("/users").send({
        firstName: "Jane",
        email: "jane@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail if email is already taken", async () => {
      const res = await request(app).post("/users").send({
        firstName: "Duplicate",
        lastName: "User",
        email: "john.doe@example.com", // same as happy path
        password: "password123",
        birthDate: "1995-05-05",
        heightCm: 170,
        gender: "female",
      });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /users/:userId", () => {
    let user;
    let token;

    beforeAll(async () => {
      // Create a test user
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.User.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@example.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        },
      });

      // Log in to get token
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "johndoe@example.com", password: "password123" });

      token = loginRes.body.token;
    });

    afterAll(async () => {
      await prisma.User.deleteMany();
      await prisma.$disconnect();
    });

    it("should retrieve the user when authorized", async () => {
      const res = await request(app)
        .get(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.id).toBe(user.id);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get(`/users/${user.id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 403 if trying to access another user", async () => {
      // Create another user to simulate "other profile"
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      const otherUser = await prisma.User.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other.user@example.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        },
      });

      const res = await request(app)
        .get(`/users/${otherUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403); // because authorizeParam() should block mismatched IDs
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("PATCH /users/:userId", () => {
    let user;
    let token;

    beforeAll(async () => {
      // Create a test user
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.User.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@example.com",
          passwordHash,
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        },
      });

      // Log in to get token
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "johndoe@example.com", password: "password123" });

      token = loginRes.body.token;
    });

    afterAll(async () => {
      await prisma.User.deleteMany();
      await prisma.$disconnect();
    });

    it("should update all fields successfully", async () => {
      const res = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Johnny",
          lastName: "Brianson",
          email: "johnnyb@example.com",
          password: "shd09sdhidosdhio",
          birthDate: new Date("1990-01-01"),
          heightCm: 175,
          gender: "male",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User successfully updated");
      expect(res.body.user.firstName).toBe("Johnny");
      expect(res.body.user.lastName).toBe("Brianson");
      expect(res.body.user.email).toBe("johnnyb@example.com");
      const isPasswordCorrect = await bcrypt.compare(
        "shd09sdhidosdhio",
        res.body.user.passwordHash
      );
      expect(isPasswordCorrect).toBe(true);
      expect(new Date(res.body.user.birthDate)).toEqual(new Date("1990-01-01"));
      expect(res.body.user.heightCm).toBe(175);
      expect(res.body.user.gender).toBe("male");
    });

    it("should update a single field", async () => {
      const res = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          lastName: "Smith",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.lastName).toBe("Smith");
      expect(res.body.user.email).toBe("johnnyb@example.com");
    });

    it("should reject invalid gender", async () => {
      const res = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          gender: "not-a-gender",
        });

      expect(res.status).toBe(400); // comes from your validator
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 403 if another user tries to update this account", async () => {
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      // create another user
      const other = await prisma.User.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash,
          birthDate: new Date("1992-03-01"),
          heightCm: 200,
          gender: "female",
        },
      });

      // login as `other`
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "other@example.com", password });

      const otherToken = loginRes.body.token;

      const res = await request(app)
        .patch(`/users/${user.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ firstName: "Hacker" });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      await prisma.User.delete({ where: { id: other.id } });
    });
  });

  describe("DELETE /users/:userId", () => {
    let user;
    let token;

    beforeAll(async () => {
      // Create a test user
      const password = "password123";
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.User.create({
        data: {
          firstName: "Jane",
          lastName: "Doe",
          email: "janedoe@example.com",
          passwordHash,
          birthDate: new Date("1991-02-02"),
          heightCm: 165,
          gender: "female",
        },
      });

      // Log in to get token
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "janedoe@example.com", password });

      token = loginRes.body.token;
    });

    afterAll(async () => {
      await prisma.User.deleteMany();
      await prisma.$disconnect();
    });

    it("should delete the user successfully", async () => {
      const res = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");

      // Confirm user no longer exists
      const deletedUser = await prisma.User.findUnique({ where: { id: user.id } });
      expect(deletedUser).toBeNull();
    });
    
    it("should return 401 if not logged in", async () => {
      const res = await request(app).delete(`/users/${user.id}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 for invalid userId param", async () => {
      const res = await request(app)
        .delete("/users/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400); // assuming your validator returns 400
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 403 if user tries to delete another account", async () => {
      // Create another user
      const otherPassword = await bcrypt.hash("otherpass", 10);
      const otherUser = await prisma.User.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          passwordHash: otherPassword,
          birthDate: new Date("1991-02-02"),
          heightCm: 165,
          gender: "female",
        },
      });

      // Log in as this other user
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "other@example.com", password: "otherpass" });

      const otherToken = loginRes.body.token;

      const res = await request(app)
        .delete(`/users/${user.id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      await prisma.User.delete({ where: { id: otherUser.id } });
    });
  })
});
