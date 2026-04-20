// backend/index.js
const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(express.json());

// --- Configuration ---
const REGION = process.env.REGION || "ap-northeast-1";
const TABLE_NAME = process.env.TABLE_NAME || "TodoTable";

// --- DynamoDB Client Setup ---
const clientConfig = { region: REGION };

// If DYNAMODB_ENDPOINT exists (Local Development), use it.
// Otherwise, the SDK will automatically use IAM Task Roles (ECS Production).
if (process.env.DYNAMODB_ENDPOINT) {
  console.log(`Connecting to local DynamoDB at ${process.env.DYNAMODB_ENDPOINT}`);
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
  clientConfig.credentials = {
    accessKeyId: "local",
    secretAccessKey: "local",
  };
}

const client = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(client);

// --- API Routes ---

/**
 * Health Check for ALB
 */
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

/**
 * GET /api/todos
 * Fetch all items from DynamoDB
 */
app.get("/api/todos", async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/todos
 * Create a new todo item
 */
app.post("/api/todos", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });

    const newTodo = {
      id: Date.now().toString(),
      task,
      createdAt: new Date().toISOString(),
      done: false,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newTodo,
    });

    await docClient.send(command);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error saving todo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});