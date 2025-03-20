const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const createDrawingTable = async () => {
  const command = new CreateTableCommand({
    TableName: process.env.DYNAMODB_DRAWING_TABLE || "DrawingStrokes",
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" }, // ROOM#${roomId}
      { AttributeName: "SK", AttributeType: "S" }, // STROKE#${timestamp}#${strokeId}
      { AttributeName: "GSI1PK", AttributeType: "S" }, // ROOM#${roomId}
      { AttributeName: "GSI1SK", AttributeType: "S" }, // STROKE#${timestamp}
    ],
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  try {
    const response = await client.send(command);
    console.log("Table created successfully:", response);
  } catch (error) {
    if (error instanceof Error && error.name === "ResourceInUseException") {
      console.log("Table already exists");
    } else {
      console.error("Error creating table:", error);
    }
  }
};

createDrawingTable(); 