// Test for the process-image route
// This test was written with assistance from ChatGPT
// https://chatgpt.com/c/6921e80a-f350-8332-ad99-65a740af5b01

const request = require("supertest");
const path = require("path");
const app = require("../app");


describe("POST /api/process-image", () => {
  it("should process the image and return result", async () => {
    const res = await request(app)
      .post("/api/process-image")
      .field("imgType", "barcode")
      .attach("image", path.join(__dirname, "cheetos-barcode.jpg"));

    expect(res.status).toBe(200);
    expect(res.body.result).toEqual({ "Cheetos Crunch Cheese, Baked": 1 });
  });

  it("should return 400 for invalid imgType", async () => {
    const res = await request(app)
      .post("/api/process-image")
      .field("imgType", "invalid")
      .attach("image", path.join(__dirname, "cheetos-barcode.jpg"));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid imgType");
  });
});
