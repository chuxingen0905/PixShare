// ✅ Lambda function to handle photo sharing presigned URL requests
// This function should be connected to GET /photos/sharing endpoint
// Checks for the special header and returns a presigned URL for shared photos

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = "ap-southeast-5";
const BUCKET_NAME = "your-s3-bucket-name"; // Replace with your bucket name

const s3Client = new S3Client({ region: REGION });

export const handler = async (event) => {
  console.log('🔄 Presigned URL Lambda invoked');
  console.log('📥 Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the special header from the request
    const specialHeader = event.headers['x-special-token'] || event.headers['X-Special-Token'];
    
    console.log('🔑 Special header received:', specialHeader);
    
    // Validate the special header
    if (!specialHeader) {
      console.error('❌ No special header provided');
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ error: "Special header 'X-Special-Token' is required" }),
      };
    }
    
    // Check if the header is valid (you can customize this logic)
    const validHeaders = [
      'ba1f25bccb619e3d',  // Your specific header
      // Add more valid headers as needed
    ];
    
    if (!validHeaders.includes(specialHeader)) {
      console.error('❌ Invalid special header:', specialHeader);
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ error: "Invalid or unauthorized header" }),
      };
    }
    
    // Map header to S3 object key (customize this mapping)
    const objectKeyMap = {
      'ba1f25bccb619e3d': 'shared-content/special-image-1.jpg', // Replace with actual S3 key
      // Add more mappings as needed
    };
    
    const objectKey = objectKeyMap[specialHeader];
    
    if (!objectKey) {
      console.error('❌ No content mapped for header:', specialHeader);
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ error: "No content available for this header" }),
      };
    }
    
    console.log('📄 S3 object key:', objectKey);
    
    // Generate presigned URL for S3 object
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey
    });
    
    // Set expiration time (1 hour = 3600 seconds)
    const expiresIn = 3600;
    
    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      
      console.log('✅ Presigned URL generated successfully');
      console.log('🔗 URL length:', presignedUrl.length);
      
      const successResponse = {
        presignedUrl: presignedUrl,
        objectKey: objectKey,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
        header: specialHeader
      };
      
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify(successResponse),
      };
      
    } catch (s3Error) {
      console.error('❌ S3 error generating presigned URL:', s3Error);
      
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ 
          error: "Failed to generate presigned URL",
          details: s3Error.message
        }),
      };
    }
    
  } catch (err) {
    console.error("💀 Error in presigned URL Lambda:", err);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Special-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
      body: JSON.stringify({ 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }),
    };
  }
};
