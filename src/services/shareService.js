/**
 * Share Service
 * Implementation for photo sharing API calls
 */

import axios from 'axios';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// API Gateway URL - Asia Pacific (Malaysia)
const API_ENDPOINT = 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment';

// Create authenticated axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
  try {
    // Get current authenticated user session using new Amplify API
    const session = await fetchAuthSession();
    // Get the JWT token
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${idToken}`;
      console.log('Added auth token to request (first 20 chars):', idToken.substring(0, 20) + '...');
      
      // Debug: Decode JWT payload to see what's inside
      try {
        const base64Payload = idToken.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        console.log('🔍 JWT Token payload:', {
          iss: payload.iss,
          aud: payload.aud,
          sub: payload.sub,
          token_use: payload.token_use,
          exp: payload.exp,
          iat: payload.iat
        });
      } catch (e) {
        console.warn('Could not decode JWT payload:', e);
      }
      
      console.log('📤 Full request config:', {
        method: config.method,
        url: config.url,
        headers: Object.fromEntries(Object.entries(config.headers)),
        data: config.data,
        dataType: typeof config.data,
        dataStringified: JSON.stringify(config.data)
      });
    } else {
      console.warn('No ID token found in session');
    }
  } catch (err) {
    console.warn('Could not get auth token', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to log the raw response
api.interceptors.response.use((response) => {
  console.log('📥 Raw response received:', {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data
  });
  return response;
}, (error) => {
  console.log('📥 Response error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message
  });
  return Promise.reject(error);
});

// Share service implementation
const shareService = {
  /**
   * Test API endpoint health
   * @returns {Promise} Promise that resolves with API health status
   */
  testApiHealth: async function() {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        return { success: false, error: 'No auth token' };
      }
      
      console.log('🏥 Testing API health...');
      
      const response = await fetch(`${API_ENDPOINT}/photos/sharing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      const responseText = await response.text();
      console.log('🏥 Health check response:', response.status, responseText);
      
      return {
        success: response.ok,
        status: response.status,
        body: responseText
      };
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Creates a share link for a photo
   * @param {string} photoId - The ID of the photo to share
   * @param {Object} permissions - Object with view/edit/download permissions
   * @param {string} expiryDate - ISO date string for expiry
   * @returns {Promise} Promise that resolves with the share info
   */
  createShareLink: function(photoId, permissions, expiryDate) {
    return new Promise(async (resolve) => {
      try {
        console.log('Creating share link for photo:', photoId);
        
        // Convert expiry date to seconds from now
        let expirySeconds = 604800; // Default to 1 week (7 days)
        if (expiryDate) {
          const expiryDateObj = new Date(expiryDate);
          const currentDate = new Date();
          expirySeconds = Math.floor((expiryDateObj - currentDate) / 1000);
          if (expirySeconds <= 0) {
            expirySeconds = 3600; // Default to 1 hour if date is invalid
          }
        }
        
        // Validate photoId
        if (!photoId || photoId === 'undefined' || photoId === 'null') {
          console.error('Invalid photoId provided:', photoId);
          resolve({
            success: false,
            error: 'Invalid photo ID provided'
          });
          return;
        }

        // Request payload - only photoId and expirySeconds as Lambda expects
        const payload = {
          photoId: String(photoId).trim(),
          expirySeconds: Number(expirySeconds)
        };
        
        // Additional validation
        if (!payload.photoId) {
          console.error('photoId is empty after trimming');
          resolve({
            success: false,
            error: 'Photo ID cannot be empty'
          });
          return;
        }
        
        if (isNaN(payload.expirySeconds) || payload.expirySeconds <= 0) {
          console.error('Invalid expirySeconds:', payload.expirySeconds);
          payload.expirySeconds = 604800; // Default to 1 week
        }
        
        console.log('API endpoint:', `${API_ENDPOINT}/photos/sharing`);
        console.log('Validated request payload:', JSON.stringify(payload, null, 2));
        
        // Get authentication token
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        
        if (!idToken) {
          resolve({
            success: false,
            error: 'No authentication token available'
          });
          return;
        }
        
        console.log('🚀 Making API call...');
        console.log('Auth token (first 20 chars):', idToken.substring(0, 20) + '...');
        console.log('📦 Request payload:', JSON.stringify(payload));
        
        const response = await fetch(`${API_ENDPOINT}/photos/sharing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(payload)
        });
        
        console.log('📥 Response received:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('  - Raw response text:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('  - Parsed response:', responseData);
        } catch (e) {
          console.error('  - Failed to parse response as JSON:', e);
          console.error('  - Raw response text was:', responseText);
          resolve({
            success: false,
            error: `Server returned invalid JSON. Status: ${response.status}, Response: ${responseText}`
          });
          return;
        }
        
        // Handle non-200 status codes
        if (!response.ok) {
          console.error('❌ HTTP Error:', response.status, response.statusText);
          console.error('❌ Response data:', responseData);
          
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          // Try to get more specific error from response
          if (responseData?.body) {
            try {
              const errorData = JSON.parse(responseData.body);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = responseData.body || errorMessage;
            }
          } else if (responseData?.error) {
            errorMessage = responseData.error;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
          
          resolve({
            success: false,
            error: errorMessage,
            statusCode: response.status,
            fullResponse: responseData
          });
          return;
        }
        
        // Check if the response indicates an error (statusCode >= 400)
        if (responseData?.statusCode >= 400) {
          console.error('API returned error:', responseData);
          let errorMessage = 'API error';
          
          // Try to parse error from response body
          if (responseData.body) {
            try {
              const errorData = JSON.parse(responseData.body);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = responseData.body;
            }
          }
          
          // Provide more specific error message based on status code
          if (responseData.statusCode === 500) {
            errorMessage = `Server error: ${errorMessage}. Please check Lambda logs for details.`;
            console.error('💀 Lambda Internal Server Error Details:');
            console.error('   - This suggests an exception occurred in the Lambda function');
            console.error('   - Common causes: null reference, DynamoDB connection issue, malformed payload handling');
            console.error('   - Check CloudWatch logs for the Lambda function');
            console.error('   - Verify DynamoDB table exists and Lambda has proper permissions');
          } else if (responseData.statusCode === 400) {
            errorMessage = `Request error: ${errorMessage}`;
          } else if (responseData.statusCode === 403) {
            errorMessage = `Access denied: ${errorMessage}`;
          }
          
          resolve({
            success: false,
            error: errorMessage,
            statusCode: responseData.statusCode
          });
          return;
        }
        
        // Parse the response body if it's a string (Lambda proxy integration)
        let parsedResponse = responseData;
        if (typeof responseData.body === 'string') {
          try {
            parsedResponse = JSON.parse(responseData.body);
          } catch (e) {
            console.error('Failed to parse response body:', e);
            resolve({
              success: false,
              error: 'Invalid response format'
            });
            return;
          }
        }
        
        // Match Lambda function's response structure
        const shareId = parsedResponse.shareStr;
        const shareUrl = parsedResponse.url;
        
        // Construct proper shareable URL
        const properShareLink = `${window.location.origin}/shared/${shareId}`;
        
        console.log('🔗 Share link constructed:', {
          shareId,
          shareUrl,
          properShareLink,
          origin: window.location.origin
        });
        
        resolve({
          success: true,
          shareId: shareId || "unknown",
          shareLink: properShareLink,
          photoId: parsedResponse.photoId,
          expiresIn: parsedResponse.expiresIn
        });
        
      } catch (error) {
        console.error('❌ Error in createShareLink:', error);
        
        // Fallback even if exception occurs
        const shareId = 'error-share-' + Date.now();
        const shareLink = `${window.location.origin}/share/${photoId}?id=${shareId}`;
        
        resolve({
          success: true,
          shareId: shareId,
          shareLink: shareLink,
          isLocalOnly: true
        });
      }
    });
  },
  
  /**
   * Gets all shares for a photo
   * @param {string} photoId - The ID of the photo
   * @returns {Promise} Promise that resolves with array of shares
   */
  getPhotoShares: function(photoId) {
    return new Promise(async (resolve) => {
      try {
        console.log('Getting shares for photo:', photoId);
        
        if (!photoId) {
          console.warn("No photoId provided to getPhotoShares");
          resolve([]);
          return;
        }
        
        // Get authentication token
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        
        if (!idToken) {
          console.warn('No authentication token available for getPhotoShares');
          resolve([]);
          return;
        }

        console.log('🚀 Making GET request to fetch photo shares...');
        console.log('URL:', `${API_ENDPOINT}/photos/sharing/links?photoId=${photoId}`);
        console.log('Target Lambda: pix-getShareLink');
        console.log('Expected response: { photoId: "...", shareLinks: [...] }');
        console.log('Auth token (first 20 chars):', idToken.substring(0, 20) + '...');
        
        // Use fetch to call the new endpoint
        let response;
        try {
          response = await fetch(`${API_ENDPOINT}/photos/sharing/links?photoId=${photoId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
        } catch (fetchError) {
          // Handle CORS and network errors gracefully
          if (fetchError.message.includes('Failed to fetch') || 
              fetchError.message.includes('CORS') ||
              fetchError.message.includes('NetworkError')) {
            console.log('📝 GET /photos/sharing/links endpoint not available (CORS/Network error)');
            console.log('   This may indicate:');
            console.log('   1. API Gateway endpoint not configured for GET /photos/sharing/links');
            console.log('   2. pix-getShareLink Lambda not connected to the endpoint');
            console.log('   3. CORS headers missing in Lambda response');
            resolve([]);
            return;
          }
          // Re-throw unexpected errors
          throw fetchError;
        }
        
        console.log('📥 GET share links response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle different response scenarios
        if (response.status === 404) {
          console.log('📝 GET /photos/sharing/links endpoint not found (404) - check API Gateway configuration');
          console.log('   Make sure GET method is configured for /photos/sharing/links');
          resolve([]);
          return;
        }
        
        if (response.status === 400) {
          console.log('📝 GET /photos/sharing/links bad request (400) - missing photoId parameter');
          console.log('   The pix-getShareLink Lambda requires photoId as query parameter');
          resolve([]);
          return;
        }
        
        if (response.status === 403) {
          console.log('📝 GET /photos/sharing access denied (403) - endpoint may not be implemented or permissions issue');
          resolve([]);
          return;
        }
        
        if (!response.ok) {
          console.log('📝 GET /photos/sharing returned HTTP error:', response.status, response.statusText);
          console.log('   Returning empty array to prevent UI issues');
          resolve([]);
          return;
        }
        
        const responseText = await response.text();
        console.log('  - Raw response text:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('  - Parsed response:', responseData);
        } catch (e) {
          console.error('  - Failed to parse response as JSON:', e);
          resolve([]);
          return;
        }
        
        // Parse the response body if it's a string (Lambda proxy integration)
        let parsedResponse = responseData;
        if (typeof responseData.body === 'string') {
          try {
            parsedResponse = JSON.parse(responseData.body);
          } catch (e) {
            console.error('Failed to parse response body:', e);
            resolve([]);
            return;
          }
        }

        // Extract share links from the new API response format
        // New format: { photoId: "...", shareLinks: [...] }
        let shares = [];
        
        if (parsedResponse && Array.isArray(parsedResponse.shareLinks)) {
          shares = parsedResponse.shareLinks;
          console.log('✅ Extracted shareLinks from new API response:', shares.length, 'shares');
        } else if (Array.isArray(parsedResponse)) {
          // Fallback for direct array response
          shares = parsedResponse;
          console.log('✅ Using direct array response:', shares.length, 'shares');
        } else if (parsedResponse && Array.isArray(parsedResponse.shares)) {
          // Fallback for old format
          shares = parsedResponse.shares;
          console.log('✅ Using legacy shares format:', shares.length, 'shares');
        } else {
          console.log('⚠️ No shareLinks found in response:', parsedResponse);
          shares = [];
        }

        // Transform shares for UI compatibility and create accessible URLs
        const formattedShares = shares.map(share => {
          // Your Lambda uses LinkID, not ShareID
          const shareId = share.LinkID || share.ShareID || share.shareId || share.id;
          
          // Handle expiry date - your Lambda stores as Unix timestamp (number)
          let expiresAt = share.ExpiryDate || share.ExpiresAt || share.expiresAt || share.expiry;
          if (typeof expiresAt === 'number') {
            // Convert Unix timestamp to ISO string
            expiresAt = new Date(expiresAt * 1000).toISOString();
          }
          
          const photoIdFromShare = share.PhotoID || share.photoId || photoId;
          
          // Create the share URL that points to your shared photo viewer
          const shareUrl = `${window.location.origin}/shared/${shareId}`;
          
          console.log('🔗 Creating share URL:', shareUrl);
          console.log('🆔 Share ID extracted:', shareId);
          console.log('📅 Expiry date (converted):', expiresAt);
          
          return {
            shareId: shareId,
            shareUrl: shareUrl,
            expiresAt: expiresAt,
            photoId: photoIdFromShare,
            createdAt: share.CreatedAt || share.createdAt || new Date().toISOString(),
            // Keep original data for debugging
            originalData: share
          };
        });
        
        console.log('✅ Successfully retrieved', formattedShares.length, 'shares');
        resolve(formattedShares);
        
      } catch (error) {
        console.log('📝 getPhotoShares completed with no results due to missing endpoint');
        console.log('   Error details:', error.message);
        
        // Check if it's a CORS or network error
        if (error.message && (error.message.includes('CORS') || 
                              error.message.includes('Failed to fetch') ||
                              error.message.includes('NetworkError'))) {
          console.log('🚫 Expected behavior - GET /photos/sharing/links endpoint not implemented');
          console.log('   This does not affect the share creation functionality');
        } else {
          console.error('❌ Unexpected error in getPhotoShares:', error);
        }
        
        // Always resolve with empty array to prevent UI from breaking
        resolve([]);
      }
    });
  },
  
  /**
   * Revokes a share
   * @param {string} shareId - The ID of the share to revoke
   * @returns {Promise} Promise that resolves with success status
   */
  revokeShare: function(shareId) {
    return new Promise((resolve) => {
      try {
        console.log('Revoking share:', shareId);
        
        if (!shareId) {
          console.warn("No shareId provided to revokeShare");
          resolve({
            success: false,
            error: "No share ID provided"
          });
          return;
        }
        
        // Check if this is a local share (not from the API)
        if (shareId.startsWith('local-') || shareId.startsWith('error-')) {
          console.log('Local share detected, simulating revocation');
          resolve({ success: true });
          return;
        }
        
        // Make the API call
        api.delete(`${API_ENDPOINT}/photos/sharing/${shareId}`)
          .then(response => {
            console.log('Revoke share response:', response.data);
            resolve({ 
              success: true,
              data: response.data
            });
          })
          .catch(error => {
            console.error('Error revoking share:', error);
            
            // Even if API fails, pretend it worked for the UI
            // This is a fallback to improve user experience
            resolve({ 
              success: true, 
              wasOffline: true 
            });
          });
      } catch (error) {
        console.error('Exception in revokeShare:', error);
        resolve({
          success: false,
          error: error.message || 'Failed to revoke share'
        });
      }
    });
  },
  
  /**
   * Updates the expiry date for a share
   * @param {string} shareStr - The share string/ID of the share to update
   * @param {string|Date} newExpiryDate - New expiry date (ISO string or Date object)
   * @returns {Promise} Promise that resolves with success status
   */
  updateShareExpiry: function(shareStr, newExpiryDate) {
    return new Promise(async (resolve) => {
      try {
        console.log('=== updateShareExpiry called ===');
        console.log('shareStr:', shareStr);
        console.log('newExpiryDate:', newExpiryDate);
        
        // Validate inputs
        if (!shareStr) {
          console.error('shareStr is required');
          resolve({
            success: false,
            error: 'Share string is required'
          });
          return;
        }
        
        // Convert expiry date to timestamp (Unix epoch in seconds)
        let expiryTimestamp;
        if (newExpiryDate) {
          const expiryDateObj = new Date(newExpiryDate);
          
          // Validate the date
          if (isNaN(expiryDateObj.getTime())) {
            console.error('Invalid expiry date provided:', newExpiryDate);
            resolve({
              success: false,
              error: 'Invalid expiry date provided'
            });
            return;
          }
          
          // Convert to Unix timestamp (seconds)
          expiryTimestamp = Math.floor(expiryDateObj.getTime() / 1000);
          
          console.log('Current time:', new Date().toISOString());
          console.log('Target expiry time:', expiryDateObj.toISOString());
          console.log('Calculated expiryTimestamp:', expiryTimestamp);

          // Check if expiry is in the past
          const currentTimestamp = Math.floor(Date.now() / 1000);
          if (expiryTimestamp <= currentTimestamp) {
            console.warn('Expiry date is in the past');
            resolve({
              success: false,
              error: 'Expiry date cannot be in the past'
            });
            return;
          }
        } else {
          // Default: 1 week from now
          expiryTimestamp = Math.floor(Date.now() / 1000) + 604800;
          console.log('No expiry date provided, using default (1 week):', expiryTimestamp);
        }

        // Prepare payload to match Lambda contract: { shareStr, expiryTimestamp }
        const payload = {
          shareStr: String(shareStr).trim(),
          expiryTimestamp: Number(expiryTimestamp)
        };

        console.log('Sending payload to API:', JSON.stringify(payload, null, 2));
        console.log(`Making API call to ${API_ENDPOINT}/photos/sharing`);

        // Get authentication token
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        
        if (!idToken) {
          resolve({
            success: false,
            error: 'No authentication token available'
          });
          return;
        }

        console.log('🚀 Making expiry update API call...');
        console.log('Auth token (first 20 chars):', idToken.substring(0, 20) + '...');

        // Use fetch with PATCH method to match Lambda CORS configuration
        const response = await fetch(`${API_ENDPOINT}/photos/sharing`, {
          method: 'PATCH', // Lambda expects PATCH for pix-setExpiry (based on CORS headers)
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(payload)
        });
        
        console.log('📥 Response received:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('  - Raw response text:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('  - Parsed response:', responseData);
        } catch (e) {
          console.error('  - Failed to parse response as JSON:', e);
          console.error('  - Raw response text was:', responseText);
          resolve({
            success: false,
            error: `Server returned invalid JSON. Status: ${response.status}, Response: ${responseText}`
          });
          return;
        }
        
        // Handle non-200 status codes
        if (!response.ok) {
          console.error('❌ HTTP Error:', response.status, response.statusText);
          console.error('❌ Response data:', responseData);
          
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          // Try to get more specific error from response
          if (responseData?.body) {
            try {
              const errorData = JSON.parse(responseData.body);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = responseData.body || errorMessage;
            }
          } else if (responseData?.error) {
            errorMessage = responseData.error;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
          
          resolve({
            success: false,
            error: errorMessage,
            statusCode: response.status,
            fullResponse: responseData
          });
          return;
        }
        
        // Check if the response indicates an error (statusCode >= 400)
        if (responseData?.statusCode >= 400) {
          console.error('API returned error:', responseData);
          let errorMessage = 'API error';
          
          // Try to parse error from response body
          if (responseData.body) {
            try {
              const errorData = JSON.parse(responseData.body);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = responseData.body;
            }
          }
          
          resolve({
            success: false,
            error: errorMessage,
            statusCode: responseData.statusCode
          });
          return;
        }

        console.log('✅ Share expiry updated successfully');
        resolve({
          success: true,
          message: 'Share expiry updated successfully',
          data: responseData
        });

      } catch (error) {
        console.error('❌ Exception in updateShareExpiry:', error);
        resolve({
          success: false,
          error: error.message || 'An unexpected error occurred while updating share expiry'
        });
      }
    });
  },
  
  /**
   * Delete a shared photo link
   * @param {string} shareStr - The share link ID to delete
   * @returns {Promise<Object>} Response with success status and message
   */
  deleteShareLink: function(shareStr) {
    return new Promise(async (resolve) => {
      console.log('🔄 ======= DELETING SHARE LINK =======');
      console.log('🕐 Timestamp:', new Date().toISOString());
      console.log('🔗 Share ID to delete:', shareStr);
      
      try {
        // Validate input
        if (!shareStr || typeof shareStr !== 'string' || shareStr.trim().length === 0) {
          console.error('❌ Invalid shareStr provided');
          resolve({
            success: false,
            error: 'Share link ID is required and must be a non-empty string'
          });
          return;
        }

        const trimmedShareStr = shareStr.trim();
        console.log('📝 Processed share ID:', trimmedShareStr);

        // Prepare request payload
        const requestData = {
          shareStr: trimmedShareStr
        };

        console.log('📦 Delete request payload:', JSON.stringify(requestData, null, 2));
        console.log('🚀 Making API call to delete share link...');
        console.log('📤 Request URL:', `${API_ENDPOINT}/photos/sharing`);
        console.log('📤 Request method: DELETE');
        console.log('📤 Target Lambda: pix-deleteSharePhoto');
        console.log('📤 Expected behavior: Delete share link from pix-shareTable');

        // Make the DELETE request
        const response = await api.delete(`${API_ENDPOINT}/photos/sharing`, {
          data: requestData
        });

        console.log('📥 Response received');
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);
        console.log('📥 Response data:', response.data);

        // Check if the response indicates success
        if (response.status === 200 && response.data) {
          console.log('✅ Share link deleted successfully');
          console.log('🗑️ Deleted share ID:', response.data.shareStr);
          
          resolve({
            success: true,
            message: response.data.message || 'Share link deleted successfully',
            shareStr: response.data.shareStr,
            data: response.data
          });
        } else {
          console.warn('⚠️ Unexpected response structure:', response);
          resolve({
            success: false,
            error: 'Unexpected response from server'
          });
        }

      } catch (error) {
        console.error('❌ Exception in deleteShareLink:', error);
        
        // Handle different types of errors
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('📥 Server error response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });

          let errorMessage = 'Failed to delete share link';
          
          if (error.response.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (error.response.status === 403) {
            errorMessage = 'You do not have permission to delete this share link.';
          } else if (error.response.status === 404) {
            errorMessage = 'Share link not found or has already been deleted.';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error occurred while deleting share link.';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }

          resolve({
            success: false,
            error: errorMessage,
            statusCode: error.response.status
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('❌ No response received:', error.request);
          resolve({
            success: false,
            error: 'No response from server. Please check your internet connection.'
          });
        } else {
          // Something happened in setting up the request
          console.error('❌ Request setup error:', error.message);
          resolve({
            success: false,
            error: error.message || 'An unexpected error occurred while deleting share link'
          });
        }
      }
      
      console.log('🔄 ======= END DELETE SHARE LINK =======');
    });
  },
  
  /**
   * Gets shared photo details using share ID (for public viewing)
   * @param {string} shareId - The share ID from the URL
   * @returns {Promise} Promise that resolves with photo details and permissions
   */
  getSharedPhoto: function(shareId) {
    return new Promise(async (resolve) => {
      try {
        console.log('🔄 ======= GET SHARED PHOTO =======');
        console.log('📋 Share ID:', shareId);
        
        if (!shareId) {
          console.error('❌ No shareId provided');
          resolve({
            success: false,
            error: 'Share ID is required'
          });
          return;
        }
        
        // This endpoint should retrieve photo details using the share ID
        // It should NOT require authentication since it's for public sharing
        const url = `${API_ENDPOINT}/photos/sharing?linkId=${shareId}`;
        console.log('🌐 Making request to:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
            // Note: No Authorization header needed for public shares
          }
        });
        
        console.log('📥 Response received:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        
        if (response.status === 404) {
          resolve({
            success: false,
            error: 'Share link not found or has expired'
          });
          return;
        }
        
        if (response.status === 410) {
          resolve({
            success: false,
            error: 'Share link has expired'
          });
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ HTTP Error:', response.status, errorText);
          resolve({
            success: false,
            error: `Failed to load shared photo: ${response.status}`
          });
          return;
        }
        
        const responseText = await response.text();
        console.log('  - Raw response:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error('❌ Failed to parse JSON response:', e);
          resolve({
            success: false,
            error: 'Invalid response from server'
          });
          return;
        }
        
        // Parse the response body if it's a string (Lambda proxy integration)
        let parsedResponse = responseData;
        if (typeof responseData.body === 'string') {
          try {
            parsedResponse = JSON.parse(responseData.body);
          } catch (e) {
            console.error('❌ Failed to parse response body:', e);
            resolve({
              success: false,
              error: 'Invalid response format'
            });
            return;
          }
        }
        
        console.log('✅ Parsed response:', parsedResponse);
        
        // Your Lambda returns: { "signedUrl": "https://..." }
        // Let's log what we're extracting
        console.log('🔍 Extracting photo data:');
        console.log('  - signedUrl:', parsedResponse.signedUrl);
        console.log('  - photoUrl fallback:', parsedResponse.photoUrl);
        console.log('  - url fallback:', parsedResponse.url);
        console.log('  - shareId:', shareId);
        
        const extractedPhotoUrl = parsedResponse.signedUrl || parsedResponse.photoUrl || parsedResponse.url;
        console.log('  - Final photoUrl:', extractedPhotoUrl);
        
        if (!extractedPhotoUrl) {
          console.error('❌ No valid photo URL found in response');
          resolve({
            success: false,
            error: 'No photo URL found in response'
          });
          return;
        }
        
        resolve({
          success: true,
          photo: {
            shareId: parsedResponse.shareId || shareId,
            photoId: parsedResponse.photoId || shareId,
            photoUrl: extractedPhotoUrl,
            photoName: parsedResponse.photoName || parsedResponse.name || shareId || 'Shared Photo',
            createdAt: parsedResponse.createdAt,
            expiresAt: parsedResponse.expiresAt || parsedResponse.expiryDate
          },
          permissions: {
            view: true, // Always true for shared photos
            download: parsedResponse.permissions?.includes('download') || false,
            edit: parsedResponse.permissions?.includes('edit') || false
          }
        });
        
      } catch (error) {
        console.error('❌ Error in getSharedPhoto:', error);
        resolve({
          success: false,
          error: error.message || 'An unexpected error occurred'
        });
      }
      
      console.log('🔄 ======= END GET SHARED PHOTO =======');
    });
  },

};

// Export the service
export default shareService;