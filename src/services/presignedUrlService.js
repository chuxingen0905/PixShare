/**
 * Presigned URL Service
 * Handles requests to retrieve presigned URLs for photo sharing using special headers
 */

import { fetchAuthSession } from 'aws-amplify/auth';

// API Gateway URL - Asia Pacific (Malaysia)
const API_ENDPOINT = 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment';

/**
 * Get authentication headers with proper JWT token
 * @returns {Promise<Object>} Headers object with Authorization
 */
async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'Accept': 'application/json'
    };
  } catch (error) {
    console.error('❌ Failed to get auth headers:', error.message);
    throw new Error('Authentication failed. Please log in again.');
  }
}

/**
 * Retrieve presigned URL for photo sharing using linkId
 * @param {string} linkId - The special link ID value (e.g., "ba1f25bccb619e3d")
 * @returns {Promise<Object>} API response with presigned URL for shared photo
 */
export const getPresignedUrl = async (linkId) => {
  console.log('🔄 ======= RETRIEVING PRESIGNED URL =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🔑 Link ID:', linkId);
  
  try {
    // Validate input
    if (!linkId || typeof linkId !== 'string' || linkId.trim().length === 0) {
      throw new Error('Link ID is required and must be a non-empty string');
    }

    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    
    console.log('✅ Auth headers obtained successfully');

    console.log('🚀 Step 2: Making API call to get presigned URL...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/photos/sharing?linkId=${encodeURIComponent(linkId.trim())}`);
    console.log('📤 Request method: GET');
    console.log('📤 Query parameter: linkId =', linkId.trim());

    // Make API request with linkId as query parameter
    const response = await fetch(`${API_ENDPOINT}/photos/sharing?linkId=${encodeURIComponent(linkId.trim())}`, {
      method: 'GET',
      headers: headers
    });

    console.log('📥 Step 3: Processing response...');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);

    // Handle response
    if (!response.ok) {
      console.error('❌ Get presigned URL error response:', responseText);
      
      let errorMessage = 'Failed to get presigned URL';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }      // Handle specific error cases
      if (response.status === 400) {
        console.error('❌ Bad Request - Invalid or missing linkId parameter');
        errorMessage = errorMessage || 'Invalid or missing linkId parameter';
      } else if (response.status === 401) {
        console.error('❌ Unauthorized - Authentication failed');
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 403) {
        console.error('❌ Forbidden - LinkId not authorized');
        errorMessage = 'The provided link ID is not authorized to access this resource.';
      } else if (response.status === 404) {
        console.error('❌ Not Found - Resource not found for this linkId');
        errorMessage = 'The requested photo was not found or the link has expired.';
      } else if (response.status === 500) {
        console.error('💀 Server error - API failed');
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }

    // Parse successful response
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('✅ JSON parsing successful');
    } catch (e) {
      console.error('❌ Failed to parse response JSON:', e);
      return {
        success: false,
        error: 'Invalid response from server',
        statusCode: 500
      };
    }

    console.log('✅ Step 4: Presigned URL retrieved successfully');
    console.log('📋 Response data:', responseData);

    // Parse Lambda proxy integration response if needed
    let actualData = responseData;
    if (responseData.body && typeof responseData.body === 'string') {
      console.log('🔍 Detected Lambda proxy integration format, parsing body...');
      try {
        actualData = JSON.parse(responseData.body);
        console.log('📋 Parsed Lambda body:', actualData);
      } catch (e) {
        console.error('❌ Failed to parse Lambda body:', e);
        actualData = responseData;
      }
    }

    console.log('🎉 SUCCESS: Presigned URL retrieved');
    console.log('🔗 Presigned URL:', actualData.presignedUrl || actualData.url);
    console.log('🔄 ======= END GET PRESIGNED URL =======');

    return {
      success: true,
      data: actualData,
      presignedUrl: actualData.presignedUrl || actualData.url,
      message: actualData.message || 'Presigned URL retrieved successfully'
    };

  } catch (error) {
    console.error('❌ Get presigned URL error:', error.message);
    console.log('🔄 ======= END GET PRESIGNED URL (ERROR) =======');
    
    // Handle different types of errors
    if (error.message.includes('Authentication')) {
      return {
        success: false,
        error: 'Please log in to access this resource',
        statusCode: 401
      };
    }

    if (error.message.includes('Header value')) {
      return {
        success: false,
        error: error.message,
        statusCode: 400
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      statusCode: 500
    };
  }
};

// Create a default export object
const presignedUrlService = {
  getPresignedUrl
};

export default presignedUrlService;
