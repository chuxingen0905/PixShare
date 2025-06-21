// ✅ FINAL CORRECTED Lambda code for pix-addUserToGroup
// This version handles all the issues and provides comprehensive logging

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = "ap-southeast-5";
const TABLE_NAME = "pix-groupMembersTable";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  console.log('🔄 pix-addUserToGroup Lambda invoked');
  console.log('📥 Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse user and group information from request
    if (!event.body) {
      console.error('❌ No request body provided');
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const body = JSON.parse(event.body);
    const { groupId, permission } = body;
    
    console.log('📋 Parsed request body:', body);
    
    // 🔧 FIXED: Get userId from JWT claims via API Gateway authorizer
    const userId = event.requestContext?.authorizer?.claims?.sub;
    
    console.log('👤 User ID from JWT:', userId);
    console.log('🆔 Group ID:', groupId);
    console.log('🔐 Permission:', permission);

    // Validate all required fields are provided
    if (!userId) {
      console.error('❌ No user ID found in JWT claims');
      console.log('🔍 Available event structure:', {
        requestContext: event.requestContext ? 'present' : 'missing',
        authorizer: event.requestContext?.authorizer ? 'present' : 'missing',
        claims: event.requestContext?.authorizer?.claims ? 'present' : 'missing'
      });
      
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Authentication failed - no user ID found in token" }),
      };
    }
    
    if (!groupId || !permission) {
      console.error('❌ Missing required fields:', { groupId, permission });
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Missing groupId or permission" }),
      };
    }

    // Validate permission level
    const validPermissions = ['admin', 'member', 'viewer'];
    if (!validPermissions.includes(permission)) {
      console.error('❌ Invalid permission level:', permission);
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

    // Prepare the membership record
    const membershipRecord = {
      GroupID: groupId,
      UserID: userId,
      Permission: permission,
      JoinedAt: new Date().toISOString(),
    };
    
    console.log('📝 Creating membership record:', membershipRecord);

    // Insert membership record into groupMembers table
    const putCmd = new PutCommand({
      TableName: TABLE_NAME,
      Item: membershipRecord,
      // Optional: Prevent duplicate entries
      ConditionExpression: "attribute_not_exists(GroupID) AND attribute_not_exists(UserID)"
    });

    try {
      await docClient.send(putCmd);
      console.log('✅ User added to group successfully:', { userId, groupId, permission });
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log('⚠️ User already in group:', { userId, groupId });
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
      
      console.error('❌ DynamoDB error:', error);
      throw error; // Re-throw other errors
    }

    // Prepare success response
    const successResponse = {
      message: `User ${userId} added to group ${groupId} with ${permission} permission`,
      userId: userId,
      groupId: groupId,
      permission: permission,
      joinedAt: membershipRecord.JoinedAt
    };
    
    console.log('🎉 Success response:', successResponse);

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
      body: JSON.stringify(successResponse),
    };
    
  } catch (err) {
    console.error("💀 Error adding user to group:", err);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
      },
      body: JSON.stringify({ 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }),
    };
  }
};
