import { jest } from "@jest/globals";

const login = jest.fn((_req, res) => res.status(200).json({ success: true }));
const register = jest.fn((_req, res) => res.status(201).json({ success: true }));

jest.unstable_mockModule("../src/modules/auth/auth.controller.js", () => ({
  currentUser: jest.fn(),
  login,
  logout: jest.fn(),
  logoutAll: jest.fn(),
  refresh: jest.fn(),
  register,
}));
jest.unstable_mockModule("../src/middlewares/auth.middleware.js", () => ({
  requireAuth: jest.fn((_req, _res, next) => next()),
}));

const [{ default: express }, { default: request }, { default: authRouter }] =
  await Promise.all([
    import("express"),
    import("supertest"),
    import("../src/modules/auth/auth.routes.js"),
  ]);

const app = express();
app.use(express.json(), authRouter);

describe("authentication rate limits", () => {
  it("limits repeated login attempts without blocking registration", async () => {
    const credentials = { email: "client@example.com", password: "example-password" };

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      await request(app).post("/login").send(credentials).expect(200);
    }

    await request(app)
      .post("/login")
      .send(credentials)
      .expect(429)
      .expect(({ body }) => {
        expect(body.message).toMatch(/Trop de tentatives/);
      });

    await request(app)
      .post("/register")
      .send({
        name: "Client Test",
        email: "client@example.com",
        phone: "+2250102030405",
        password: "example-password",
      })
      .expect(201);
  });
});
