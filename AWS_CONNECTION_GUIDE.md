# AWS Connection and API Guide for PixShare

This guide explains how to verify your AWS connection and understand the API request/response formats for the PixShare application.

## Verifying AWS Connection

### Use the Test Pages

I've created two test pages to help you verify your AWS connection:

1. **General AWS Connection Test**:
   - Open `test-aws-connection.html` in your browser
   - Click "Run AWS Connection Test"
   - This will check:
     - If your AWS configuration is valid
     - If Cognito authentication works
     - If API Gateway is responding

2. **Photo Share Expiry API Test**:
   - Open `test-share-expiry.html` in your browser
   - Click "Run Share Expiry Test"
   - This will:
     - Create a test share
     - Update its expiry using the PATCH endpoint
     - Verify the update was successful

### Check the Console

You can also verify AWS connection by watching the browser console while using the app:

1. Open your browser Developer Tools (F12)
2. Go to the Console tab
3. Look for successful API calls and responses
4. Watch for any authorization or connection errors

## API Request/Response Formats

### Photo Share PATCH API

**Endpoint**: `PATCH /photos/sharing/{shareId}`

**Request Format**:
```json
{
  "expirySeconds": 3600  // Number of seconds from now until expiry
}
```

**Response Format**:
```json
{
  "success": true,       // Boolean indicating success
  "shareId": "abc123",   // The ID of the updated share
  "message": "Share expiry updated successfully" // Optional status message
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Photo Share GET API

**Endpoint**: `GET /photos/sharing?photoId=xxx`

**Response Format**:
```json
[
  {
    "shareId": "abc123",
    "photoId": "photo1.jpg",
    "permission": "view",
    "expirySeconds": 3600,
    "expiryDate": "2025-06-20T10:30:00Z",
    "shareUrl": "https://example.com/share/photo1.jpg?id=abc123"
  },
  {
    // Additional shares...
  }
]
```

### Photo Share POST API (Create Share)

**Endpoint**: `POST /photos/sharing`

**Request Format**:
```json
{
  "photoId": "photo1.jpg",
  "permission": "view",  // "view", "edit", or "download"
  "expirySeconds": 86400 // 24 hours
}
```

**Response Format**:
```json
{
  "shareId": "new-share-123",
  "shareUrl": "https://example.com/share/photo1.jpg?id=new-share-123"
}
```

### Photo Share DELETE API (Revoke Share)

**Endpoint**: `DELETE /photos/sharing/{shareId}`

**Response Format**:
```json
{
  "success": true,
  "message": "Share successfully revoked"
}
```

## Troubleshooting AWS Connection

1. **Authentication Issues**:
   - Make sure you're logged in (via Login page)
   - Check if the Cognito token is being sent correctly
   - Look for 401/403 errors in the API responses

2. **API Gateway Issues**:
   - Check the API URL is correct: `https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment`
   - Ensure the endpoint paths are correct
   - Check for network errors (CORS, timeouts, etc.)

3. **Lambda Function Issues**:
   - If the API Gateway responds but the operation fails, it might be a Lambda issue
   - Check the request format against what the Lambda expects
   - Look for specific error messages from the Lambda function

## Common Errors and Solutions

| Error | Possible Cause | Solution |
|-------|----------------|----------|
| "No current user" | Not authenticated | Login to the application first |
| 401 Unauthorized | Invalid/expired token | Login again to refresh token |
| 403 Forbidden | Insufficient permissions | Check IAM roles and permissions |
| Network Error | CORS or API Gateway not responding | Verify API Gateway configuration |
| "Invalid parameters" | Wrong request format | Check request body format |

## Next Steps

If you confirm the API is working correctly:

1. Use the real `shareService.js` in your application (already updated)
2. Test the share expiry update functionality in the actual app
3. Check for any console errors during operation
4. Verify that all API calls have the proper authentication headers
