// ✅ CORRECTED Lambda code for pix-addUserToGroup
// Fixed the userId extraction and variable declaration issues

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = "ap-southeast-5";
const TABLE_NAME = "pix-groupMembersTable";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  try {
    // Parse user and group information from request
    const body = JSON.parse(event.body);
    const { groupId, permission } = body;
    
    // 🔧 FIXED: Get userId from JWT claims via API Gateway authorizer
    const userId = event.requestContext.authorizer.claims.sub;

    console.log('Add user to group request:', { userId, groupId, permission });

    // Validate all required fields are provided
    if (!userId || !groupId || !permission) {
      console.error('Missing required fields:', { userId, groupId, permission });
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Missing userId, groupId, or permission" }),
      };
    }

    // Validate permission level
    const validPermissions = ['admin', 'member', 'viewer'];
    if (!validPermissions.includes(permission)) {
      console.error('Invalid permission level:', permission);
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ 
          error: `Invalid permission. Must be one of: ${validPermissions.join(', ')}` 
        }),
      };
    }

    // Insert membership record into groupMembers table
    const putCmd = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        GroupID: groupId,
        UserID: userId,
        Permission: permission,
        JoinedAt: new Date().toISOString(),
      },
      // Optional: Prevent duplicate entries
      ConditionExpression: "attribute_not_exists(GroupID) AND attribute_not_exists(UserID)"
    });

    try {
      await docClient.send(putCmd);
      console.log('User added to group successfully:', { userId, groupId, permission });
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log('User already in group:', { userId, groupId });
        return {
          statusCode: 409,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
          },
          body: JSON.stringify({ error: "User is already a member of this group" }),
        };
      }
      throw error; // Re-throw other errors
    }

    // Respond with success
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173", // Must match frontend
        "Access-Control-Allow-Credentials": "true",             // Allow cookies/auth headers
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
      },
      body: JSON.stringify({ 
        message: `User ${userId} added to group ${groupId} with ${permission} permission`,
        userId: userId,
        groupId: groupId,
        permission: permission,
        joinedAt: new Date().toISOString()
      }),
    };
  } catch (err) {
    console.error("Error adding user to group:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
