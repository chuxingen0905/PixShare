/**
 * Complete pix-getShareLink Lambda function
 * This is what your Lambda code should be to work properly
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const REGION = "ap-southeast-5";
const TABLE_NAME = "pix-shareTable";
const PHOTO_ID_INDEX = "PhotoID-index";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  console.log("🚀 GET share links function started");
  console.log("📥 Incoming event:", JSON.stringify(event, null, 2));

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
  };

  try {
    // ✅ Validate request method
    if (event.httpMethod !== "GET") {
      console.warn("❌ Invalid HTTP method:", event.httpMethod);
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // ✅ Extract photoId from query params
    const photoId = event.queryStringParameters?.photoId;
    if (!photoId) {
      console.warn("❌ Missing query param: photoId");
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing photoId query parameter" }),
      };
    }

    console.log("🔍 Querying for share links with PhotoID:", photoId);

    // ✅ Query DynamoDB using the GSI
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: PHOTO_ID_INDEX,
      KeyConditionExpression: "PhotoID = :pid",
      ExpressionAttributeValues: {
        ":pid": photoId,
      },
    });

    const result = await docClient.send(command);
    console.log(`✅ Retrieved ${result.Count} share links`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ photoId, shareLinks: result.Items || [] }),
    };

  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

console.log('📝 Lambda code above is complete and should work with your frontend!');
console.log('🔧 Make sure to update your pix-getShareLink Lambda with this complete code.');
