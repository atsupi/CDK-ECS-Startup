const request = require("supertest");
const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const app = require("./index");

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe("Todo API", () => {
  test("GET /api/health returns 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("OK");
  });

  test("GET /api/todos returns todo items", async () => {
    const mockItems = [{ id: "1", task: "Test task", done: false }];
    ddbMock.on(ScanCommand).resolves({ Items: mockItems });

    const res = await request(app).get("/api/todos");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockItems);
  });

  test("POST /api/todos creates a new todo", async () => {
    ddbMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post("/api/todos")
      .send({ task: "New Todo" });

    expect(res.statusCode).toBe(201);
    expect(res.body.task).toBe("New Todo");
    expect(res.body.done).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  test("POST /api/todos returns 400 when task is missing", async () => {
    const res = await request(app).post("/api/todos").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Task is required" });
  });
});
