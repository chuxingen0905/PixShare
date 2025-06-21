// ✅ UPDATED Lambda code for pix-addUserToGroup
// Now handles email parameter correctly

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
    // 🔧 UPDATED: Now expecting email, groupId, and permission
    const { email, groupId, permission } = body;
    
    console.log('📋 Parsed request body:', body);
    console.log('📧 Email:', email);
    console.log('🆔 Group ID:', groupId);
    console.log('🔐 Permission:', permission);

    // Get the requesting user ID from JWT claims (for authorization)
    const requestingUserId = event.requestContext?.authorizer?.claims?.sub;
    console.log('👤 Requesting User ID from JWT:', requestingUserId);

    // Validate all required fields are provided
    if (!requestingUserId) {
      console.error('❌ No requesting user ID found in JWT claims');
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
    
    if (!email || !groupId || !permission) {
      console.error('❌ Missing required fields:', { email, groupId, permission });
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Missing email, groupId, or permission" }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,POST"
        },
        body: JSON.stringify({ error: "Invalid email format" }),
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

    // TODO: In a real application, you would:
    // 1. Look up the user ID associated with the email address
    // 2. Check if the requesting user has permission to add members to this group
    // 3. Send an invitation email to the user
    // 
    // For now, we'll use a placeholder approach where we store the email
    // and treat it as if we found the user ID

    // For demonstration, we'll use the email as a placeholder user ID
    // In production, you'd look this up in a users table
    const targetUserId = `email:${email}`; // Placeholder approach
    
    console.log('🎯 Target User ID (placeholder):', targetUserId);

    // Prepare the membership record
    const membershipRecord = {
      GroupID: groupId,
      UserID: targetUserId, // In production, this would be the actual user ID
      Email: email,         // Store email for reference
      Permission: permission,
      JoinedAt: new Date().toISOString(),
      AddedBy: requestingUserId, // Track who added this member
      Status: 'invited'          // Could be 'invited', 'active', etc.
    };
    
    console.log('📝 Creating membership record:', membershipRecord);

    // Insert membership record into groupMembers table
    const putCmd = new PutCommand({
      TableName: TABLE_NAME,
      Item: membershipRecord,
      // Prevent duplicate entries for the same group and email
      ConditionExpression: "attribute_not_exists(GroupID) AND attribute_not_exists(UserID)"
    });

    try {
      await docClient.send(putCmd);
      console.log('✅ User added to group successfully:', { email, groupId, permission });
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log('⚠️ User already in group:', { email, groupId });
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
      message: `User ${email} added to group ${groupId} with ${permission} permission`,
      email: email,
      groupId: groupId,
      permission: permission,
      status: 'invited',
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
