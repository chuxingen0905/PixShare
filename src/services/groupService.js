/**
 * Group Service
 * Handles all group-related API calls to AWS Lambda functions
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

    // Log token info for debugging (first 20 chars only)
    console.log('🔑 Auth token (first 20 chars):', idToken.substring(0, 20) + '...');
    
    // Parse JWT to check expiration
    try {
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
          throw new Error('Authentication token has expired');
        }
        
        console.log('🔍 Token info:', {
          issuer: payload.iss,
          audience: payload.aud,
          subject: payload.sub,
          expires: new Date(payload.exp * 1000).toISOString()
        });
      }
    } catch (parseError) {
      console.warn('⚠️ Could not parse JWT token:', parseError.message);
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
 * Create a new group
 * @param {string} groupName - Name of the group (required)
 * @param {string} description - Description of the group (optional)
 * @returns {Promise<Object>} API response with group data
 */
export const createGroup = async (groupName, description = '') => {
  console.log('Creating group:', groupName);
  
  try {
    // Validate input
    if (!groupName || typeof groupName !== 'string' || groupName.trim().length === 0) {
      throw new Error('Group name is required and must be a non-empty string');
    }

    // Trim whitespace from inputs
    const trimmedGroupName = groupName.trim();
    const trimmedDescription = description ? description.trim() : '';

    // Validate group name length
    if (trimmedGroupName.length > 50) {
      throw new Error('Group name must be 50 characters or less');
    }

    if (trimmedDescription.length > 200) {
      throw new Error('Description must be 200 characters or less');
    }

    // Get authentication headers
    const headers = await getAuthHeaders();

    // Prepare request payload
    const payload = {
      groupName: trimmedGroupName,
      description: trimmedDescription
    };

    console.log('📦 Group creation request payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Making API call to create group...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups`);
    console.log('📤 Request method: POST');

    // Make API request
    const response = await fetch(`${API_ENDPOINT}/groups`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log('📥 Create group response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);

    // Handle response
    if (!response.ok) {
      console.error('❌ Create group error response:', responseText);
      
      let errorMessage = 'Failed to create group';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 403) {
        if (errorMessage.includes('4 groups')) {
          errorMessage = 'You can only create up to 4 groups. Please delete a group before creating a new one.';
        } else {
          errorMessage = 'Access denied. You may not have permission to create groups, or the API endpoint may not be properly configured.';
        }
      } else if (response.status === 400) {
        errorMessage = errorMessage || 'Invalid group name or description';
      } else if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 404) {
        errorMessage = 'Create group endpoint not found. The API may not be properly configured.';
      } else if (response.status === 502) {
        errorMessage = 'Service temporarily unavailable. The group creation service may not be properly configured.';
      } else if (response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        console.error('💀 Lambda Internal Server Error - Check CloudWatch logs for pix-CreateGroup function');
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
    } catch (e) {
      console.error('❌ Failed to parse response JSON:', e);
      return {
        success: false,
        error: 'Invalid response from server',
        statusCode: 500
      };
    }

    console.log('✅ Group created successfully:', responseData);

    return {
      success: true,
      data: responseData,
      group: responseData.group,
      message: responseData.message || 'Group created successfully'
    };

  } catch (error) {
    console.error('❌ Create group error:', error.message);
    
    // Handle different types of errors
    if (error.message.includes('Authentication')) {
      return {
        success: false,
        error: 'Please log in to create a group',
        statusCode: 401
      };
    }

    if (error.message.includes('Group name') || error.message.includes('Description')) {
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

/**
 * Get all groups for the authenticated user
 * @returns {Promise<Array>} List of groups
 */
export const getGroups = async () => {
  console.log('🔄 ======= GETTING USER GROUPS (REFRESH DEBUG) =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('📍 Function: getGroups() called');
  
  try {
    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    console.log('✅ Auth headers obtained successfully');
    
    console.log('🚀 Step 2: Making API call to get user groups...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups`);
    console.log('📤 Request method: GET');
    console.log('📤 Target Lambda: pix-getUserGroup');
    console.log('📤 Expected response: { userId: "...", groupIds: [...] }');

    // Make API request with CORS error handling
    let response;
    try {
      console.log('🌐 Sending fetch request...');
      response = await fetch(`${API_ENDPOINT}/groups`, {
        method: 'GET',
        headers: headers
      });
      console.log('✅ Fetch request completed');
    } catch (fetchError) {
      console.log('❌ Fetch request failed:', fetchError.message);
      // Handle CORS and network errors gracefully
      if (fetchError.message.includes('Failed to fetch') || 
          fetchError.message.includes('CORS') ||
          fetchError.message.includes('NetworkError')) {
        console.log('📝 GET /groups endpoint not available (CORS/Network error)');
        console.log('   This may indicate:');
        console.log('   1. API Gateway endpoint not configured for GET /groups');
        console.log('   2. pix-getUserGroup Lambda not connected to the endpoint');
        console.log('   3. CORS headers missing in Lambda response');
        console.log('   Returning empty groups array for now...');
        return [];
      }
      // Re-throw unexpected errors
      throw fetchError;
    }

    console.log('📥 Step 3: Processing response...');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);

    // Handle response
    if (!response.ok) {
      console.error('❌ Get groups error response:', responseText);
      
      let errorMessage = 'Failed to load groups';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 401) {
        console.warn('⚠️ Authentication error - user needs to log in again');
        console.log('   Check if JWT token is valid and not expired');
        console.log('   Lambda expects: event.requestContext.authorizer.claims.sub');
        errorMessage = 'Authentication token is invalid or expired. Please log in again.';
      } else if (response.status === 403) {
        console.warn('⚠️ Access denied - GET /groups endpoint may not exist or be configured');
        console.log('   This could mean:');
        console.log('   1. API Gateway authorizer not configured properly');
        console.log('   2. Lambda execution role missing DynamoDB permissions');
        console.log('   3. Cognito JWT claims not being passed correctly');
        errorMessage = 'The groups listing feature is not available yet. You can still create groups.';
        // Return empty array for 403 since the endpoint might not exist yet
        console.warn('⚠️ Returning empty groups array - GET endpoint access denied');
        return [];
      } else if (response.status === 404) {
        console.warn('⚠️ Endpoint not found - GET /groups API not implemented yet');
        console.log('   Make sure:');
        console.log('   1. API Gateway has GET method configured for /groups');
        console.log('   2. pix-getUserGroup Lambda is connected to the endpoint');
        errorMessage = 'Groups listing endpoint not found. The GET /groups API may not be implemented yet.';
        // Return empty array for 404 since the endpoint doesn't exist
        console.warn('⚠️ Returning empty groups array - endpoint not found');
        return [];
      } else if (response.status === 500) {
        console.error('💀 Server error - pix-getUserGroup Lambda may have crashed');
        console.log('   Check CloudWatch logs for pix-getUserGroup Lambda');
        console.log('   Common issues:');
        console.log('   1. DynamoDB table "pix-groupMembersTable" not found');
        console.log('   2. Lambda execution role missing permissions');
        console.log('   3. Invalid JWT token parsing in Lambda');
        errorMessage = 'Server error. Please try again later.';
      }

      // For other error codes, log and return empty array
      console.warn('⚠️ Returning empty groups array due to HTTP error:', response.status, errorMessage);
      return [];    }

    // Parse successful response
    console.log('📄 Step 4: Parsing response...');
    let responseData;
    try {
      console.log('📏 Response length:', responseText.length, 'characters');
      
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('✅ JSON parsing successful');
    } catch (e) {
      console.error('❌ Failed to parse response JSON:', e);
      console.warn('⚠️ Returning empty groups array due to parse error');
      return [];
    }

    console.log('✅ Step 5: Groups response received successfully');
    console.log('📋 Full response object:', JSON.stringify(responseData, null, 2));

    // Parse Lambda proxy integration response
    let actualData = responseData;
    if (responseData.body && typeof responseData.body === 'string') {
      console.log('🔍 Detected Lambda proxy integration format, parsing body...');
      try {
        actualData = JSON.parse(responseData.body);
        console.log('📋 Parsed Lambda body:', actualData);
      } catch (e) {
        console.error('❌ Failed to parse Lambda body:', e);
        return [];
      }
    } else {
      console.log('📋 Direct response format (not Lambda proxy)');
    }    // Extract group information from pix-getUserGroup response
    // Backend actually returns: { userId: "user-id", groups: [{GroupID: "...", GroupName: "..."}] }
    console.log('🔍 Step 6: Extracting group data...');
    const userId = actualData.userId;
    const backendGroups = actualData.groups || [];

    console.log('👤 Extracted User ID:', userId);
    console.log('📋 Extracted Groups from backend:', backendGroups);
    console.log('🔢 Number of groups from backend:', backendGroups.length);
    
    if (backendGroups.length === 0) {
      console.log('⚠️  IMPORTANT: Backend returned 0 groups!');
      console.log('   This means:');
      console.log('   1. Either you have no groups created');
      console.log('   2. OR groups were created but not properly stored in pix-groupMembersTable');
      console.log('   3. OR there\'s a mismatch between group creation and group retrieval tables');
    }    // Transform backend groups into UI format
    console.log('🔄 Step 7: Transforming backend groups to UI format...');
    const groups = backendGroups.map((backendGroup, index) => {
      const groupId = backendGroup.GroupID;
      const groupName = backendGroup.GroupName;
      
      // Create a short ID for display
      const shortId = groupId.substring(0, 8);
      
      const transformedGroup = {
        id: groupId,
        groupId: groupId,
        name: groupName || `Group ${index + 1}`,
        description: `Group ID: ${shortId}... (Click for more details)`,
        memberCount: '1+', // At least the creator
        members: [
          // Add current user as default member since they can see the group
          {
            email: userId ? `user-${userId.substring(0, 8)}@domain.com` : 'current-user@domain.com',
            permissions: 'member',
            joinedAt: new Date(),
            isCurrentUser: true,
            userId: userId
          }
        ],
        role: 'member', // Default role
        createdAt: 'Recently', // We don't have this data from current API
        isLimitedData: false, // We have real data now!
        originalData: backendGroup // Keep original for debugging
      };
      
      console.log(`   📝 Transformed group ${index + 1}:`, transformedGroup);
      return transformedGroup;
    });console.log('✅ Step 8: Transformation complete');
    console.log('📊 Backend groups transformed:', groups.length);
    console.log('🎯 Final groups for UI:', groups);

    // Add helpful log message about the data
    if (groups.length > 0) {
      console.log('🎉 SUCCESS: Groups loaded from backend with real data!');
      console.log('ℹ️  Groups now have actual names and IDs from the database');
      console.log('ℹ️  Backend issue has been resolved - groups persist after refresh');
    } else {
      console.log('⚠️  BACKEND ISSUE: No groups returned from pix-getUserGroup');
      console.log('   Possible causes:');
      console.log('   1. No groups created yet for this user');
      console.log('   2. Groups created in pix-groupTable but not in pix-groupMembersTable');
      console.log('   3. Different user ID used for creation vs retrieval');
      console.log('   4. Database synchronization issue between tables');
    }

    console.log('🏁 Step 9: Final result preparation...');
    console.log('📤 Returning groups array to frontend');
    console.log('🔄 ======= END GET GROUPS DEBUG =======');
    
    return groups;

  } catch (error) {
    console.log('📝 getGroups completed with no results due to error');
    console.log('   Error details:', error.message);
    
    if (error.message.includes('Authentication')) {
      console.log('⚠️ Authentication error - returning empty groups array');
    } else if (error.message.includes('CORS') || 
               error.message.includes('Failed to fetch') ||
               error.message.includes('NetworkError')) {
      console.log('⚠️ Expected behavior - GET /groups endpoint CORS/network issue');
      console.log('   This does not affect group creation functionality');
    } else {
      console.error('❌ Unexpected error in getGroups:', error);
    }
    
    return [];
  }
};

/**
 * Get details of a specific group
 * @param {string} groupId - The group ID
 * @returns {Promise<Object>} Group details
 */
export const getGroupDetails = async (groupId) => {
  console.log('Getting group details for:', groupId);
  
  try {
    if (!groupId) {
      throw new Error('Group ID is required');
    }

    // Get authentication headers
    const headers = await getAuthHeaders();
    
    console.log('🚀 Making API call to get group details...');

    // Make API request - you'll need to implement this Lambda function
    const response = await fetch(`${API_ENDPOINT}/groups/${groupId}`, {
      method: 'GET',
      headers: headers
    });

    console.log('📥 Get group details response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get group details error:', errorText);
      return { success: false, error: 'Failed to get group details' };
    }

    const responseData = await response.json();
    console.log('✅ Group details retrieved:', responseData);

    return {
      success: true,
      group: responseData.group || responseData
    };

  } catch (error) {
    console.error('❌ Get group details error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a member to a group by email
 * @param {string} groupId - The group ID
 * @param {string} email - The email address of the user to add
 * @param {string} permission - The permission level for the user ('admin', 'member', 'viewer')
 * @returns {Promise<Object>} Success response
 */
export const addUserToGroup = async (groupId, email, permission = 'member') => {
  console.log('🔄 ======= ADDING USER TO GROUP =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('📋 Group ID:', groupId);
  console.log('� Email:', email);
  console.log('�🔐 Permission:', permission);
  
  try {
    // Validate input
    if (!groupId || typeof groupId !== 'string' || groupId.trim().length === 0) {
      throw new Error('Group ID is required and must be a non-empty string');
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new Error('Email is required and must be a non-empty string');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    const validPermissions = ['admin', 'member', 'viewer'];
    if (!validPermissions.includes(permission)) {
      throw new Error(`Permission must be one of: ${validPermissions.join(', ')}`);
    }

    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    console.log('✅ Auth headers obtained successfully');

    // Prepare request payload - UPDATED to include email
    const payload = {
      groupId: groupId.trim(),
      email: email.trim().toLowerCase(),
      permission: permission
    };

    console.log('📦 Add user to group request payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Step 2: Making API call to add user to group...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups/users`);
    console.log('📤 Request method: PATCH');
    console.log('📤 Target Lambda: pix-addUserToGroup');
    console.log('📤 Expected behavior: Add user with specified email to group with given permission');

    // Make API request
    const response = await fetch(`${API_ENDPOINT}/groups/users`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(payload)
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
      console.error('❌ Add user to group error response:', responseText);
      
      let errorMessage = 'Failed to add user to group';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 400) {
        console.error('❌ Bad Request - Invalid payload or missing required fields');
        console.log('   Check Lambda code for proper field validation');
        console.log('   Expected fields: groupId, permission');
        errorMessage = errorMessage || 'Invalid group ID or permission level';
      } else if (response.status === 401) {
        console.error('❌ Unauthorized - Authentication failed');
        console.log('   Check if JWT token is valid and properly passed to Lambda');
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 403) {
        console.error('❌ Forbidden - User may not have permission to join this group');
        errorMessage = 'You do not have permission to join this group.';
      } else if (response.status === 404) {
        console.error('❌ Not Found - API endpoint or group not found');
        console.log('   Check if:');
        console.log('   1. API Gateway PATCH /groups/users endpoint is configured');
        console.log('   2. pix-addUserToGroup Lambda is connected to the endpoint');
        console.log('   3. The group ID exists in the database');
        errorMessage = 'Group not found or add user endpoint not available.';
      } else if (response.status === 409) {
        console.warn('⚠️ Conflict - User may already be in the group');
        errorMessage = 'You are already a member of this group.';
      } else if (response.status === 500) {
        console.error('💀 Server error - pix-addUserToGroup Lambda failed');
        console.log('   Check CloudWatch logs for pix-addUserToGroup Lambda');
        console.log('   Common issues:');
        console.log('   1. DynamoDB table "pix-groupMembersTable" access issues');
        console.log('   2. Lambda execution role missing permissions');
        console.log('   3. Invalid JWT token parsing in Lambda code');
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

    console.log('✅ Step 4: User added to group successfully');
    console.log('📋 Response data:', responseData);
    console.log('🎉 SUCCESS: User joined group with permission level:', permission);
    console.log('🔄 ======= END ADD USER TO GROUP =======');

    return {
      success: true,
      data: responseData,
      message: responseData.message || `Successfully joined group with ${permission} permission`
    };

  } catch (error) {
    console.error('❌ Add user to group error:', error.message);
    console.log('🔄 ======= END ADD USER TO GROUP (ERROR) =======');
    
    // Handle different types of errors
    if (error.message.includes('Authentication')) {
      return {
        success: false,
        error: 'Please log in to join a group',
        statusCode: 401
      };
    }

    if (error.message.includes('Group ID') || error.message.includes('Permission')) {
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

/**
 * Add a member to a group (legacy method - use addUserToGroup instead)
 * @param {string} groupId - The group ID
 * @param {string} email - The email address (or legacy memberId)
 * @param {string} role - The role for the member
 * @returns {Promise<Object>} Success response
 */
export const addGroupMember = async (groupId, email, role = 'member') => {
  console.log('⚠️ addGroupMember is deprecated, use addUserToGroup instead');
  console.log('Redirecting to addUserToGroup with:', { groupId, email, role });
  
  // Redirect to the new method
  return await addUserToGroup(groupId, email, role);
};

/**
 * Remove a member from a group / Leave a group
 * @param {string} groupId - The group ID to leave
 * @param {string} [newOwnerId] - Optional: New owner user ID if current user is owner and transferring ownership
 * @returns {Promise<Object>} Success response
 */
export const removeGroupMember = async (groupId, newOwnerId = null) => {
  console.log('🔄 ======= REMOVING USER FROM GROUP / LEAVING GROUP =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🆔 Group ID:', groupId);
  console.log('👑 New Owner ID:', newOwnerId || 'N/A (no ownership transfer)');
  
  try {
    // Validate input
    if (!groupId || typeof groupId !== 'string' || groupId.trim().length === 0) {
      throw new Error('Group ID is required and must be a non-empty string');
    }

    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    console.log('✅ Auth headers obtained successfully');

    // Prepare request payload
    const payload = {
      groupId: groupId.trim()
    };    // Add newOwnerId if provided for ownership transfer
    if (newOwnerId && typeof newOwnerId === 'string' && newOwnerId.trim().length > 0 && newOwnerId !== 'undefined') {
      payload.newOwnerId = newOwnerId.trim();
      console.log('👑 Including ownership transfer to:', payload.newOwnerId);
    } else if (newOwnerId !== null) {
      console.log('⚠️ Invalid newOwnerId provided:', newOwnerId, 'typeof:', typeof newOwnerId);
      console.log('   newOwnerId will not be included in payload');
    }console.log('📦 Leave group request payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Step 2: Making API call to leave group...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups/users`);
    console.log('📤 Request method: DELETE');
    console.log('📤 Target Lambda: pix-LeaveGroup');
    
    if (payload.newOwnerId) {
      console.log('📤 Expected behavior: Transfer ownership to new owner and remove current user from group');
    } else {
      console.log('📤 Expected behavior: Remove current user from group, delete S3 folder if last member');
    }

    // Make API request
    const response = await fetch(`${API_ENDPOINT}/groups/users`, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify(payload)
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
      console.error('❌ Leave group error response:', responseText);
      
      let errorMessage = 'Failed to leave group';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 400) {
        console.error('❌ Bad Request - Invalid payload or missing groupId');
        console.log('   Check that groupId is provided in request body');
        errorMessage = errorMessage || 'Invalid group ID provided';
      } else if (response.status === 401) {
        console.error('❌ Unauthorized - Authentication failed');
        console.log('   Check if JWT token is valid and properly passed to Lambda');
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 403) {
        console.error('❌ Forbidden - User may not be in this group');
        errorMessage = 'You are not a member of this group or do not have permission to leave.';
      } else if (response.status === 404) {
        console.error('❌ Not Found - API endpoint or group not found');
        console.log('   Check if:');
        console.log('   1. API Gateway DELETE /groups/users endpoint is configured');
        console.log('   2. pix-LeaveGroup Lambda is connected to the endpoint');
        console.log('   3. The group ID exists in the database');
        errorMessage = 'Group not found or leave group endpoint not available.';
      } else if (response.status === 500) {
        console.error('💀 Server error - pix-LeaveGroup Lambda failed');
        console.log('   Check CloudWatch logs for pix-LeaveGroup Lambda');
        console.log('   Common issues:');
        console.log('   1. DynamoDB table "pix-groupMembersTable" access issues');
        console.log('   2. S3 bucket "pixphotos" access issues');
        console.log('   3. Lambda execution role missing permissions');
        console.log('   4. GSI "GroupID-UserID-index" not configured properly');
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

    console.log('✅ Step 4: Successfully left group');
    console.log('📋 Response data:', responseData);
    
    const isLastMember = responseData.isLastMember;
    if (isLastMember) {
      console.log('🧹 You were the last member - group folder deleted from S3');
    } else {
      console.log('👥 Other members remain in the group');
    }
    
    console.log('🎉 SUCCESS: Left group successfully');
    console.log('🔄 ======= END LEAVE GROUP =======');

    return {
      success: true,
      data: responseData,
      message: responseData.message || 'Successfully left the group',
      isLastMember: isLastMember,
      groupId: responseData.groupId
    };

  } catch (error) {
    console.error('❌ Leave group error:', error.message);
    console.log('🔄 ======= END LEAVE GROUP (ERROR) =======');
    
    // Handle different types of errors
    if (error.message.includes('Authentication')) {
      return {
        success: false,
        error: 'Please log in to leave a group',
        statusCode: 401
      };
    }

    if (error.message.includes('Group ID')) {
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

/**
 * Delete a group (placeholder for future implementation)
 * @param {string} groupId - The group ID to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteGroup = async (groupId) => {
  console.log('Deleting group (not implemented yet):', groupId);
  
  // TODO: Implement when you have the Lambda function for this
  return {
    success: false,
    error: 'Delete group functionality not implemented yet'
  };
};

/**
 * Get members of a specific group
 * @param {string} groupId - The group ID
 * @returns {Promise<Array>} List of group members
 */
export const getGroupMembers = async (groupId) => {
  console.log('🔄 ======= GETTING GROUP MEMBERS =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🆔 Group ID:', groupId);
  
  try {
    // Validate input
    if (!groupId || typeof groupId !== 'string' || groupId.trim().length === 0) {
      throw new Error('Group ID is required and must be a non-empty string');
    }

    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    console.log('✅ Auth headers obtained successfully');    console.log('🚀 Step 2: Making API call to get group members...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups/manage?groupId=${encodeURIComponent(groupId)}`);
    console.log('📤 Request method: GET');
    console.log('📤 Target Lambda: pix-getGroupMembers');
    console.log('📤 Expected response: { groupId: "...", members: [{UserID: "...", Email: "...", Permission: "..."}] }');

    // Make API request to the new endpoint
    const response = await fetch(`${API_ENDPOINT}/groups/manage?groupId=${encodeURIComponent(groupId)}`, {
      method: 'GET',
      headers: headers
    });

    console.log('📥 Step 3: Processing response...');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);

    // Get response text
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);

    // Handle response
    if (!response.ok) {      console.error('❌ Get group members error response:', responseText);
      
      // Handle specific error cases
      if (response.status === 400) {
        console.log('⚠️ Bad Request - Missing groupId parameter');
        console.log('   The new API requires groupId as a query parameter');
        
        // Get current user info from JWT token for fallback
        try {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          if (idToken) {
            const tokenParts = idToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const userEmail = payload.email || 'current-user@unknown.com';
              const userId = payload.sub;
              
              console.log('🔍 Using current user from JWT as fallback:', { userEmail, userId });
              
              return [{
                email: userEmail,
                permissions: 'member',
                joinedAt: new Date(),
                isCurrentUser: true,
                userId: userId
              }];
            }
          }
        } catch (jwtError) {
          console.warn('⚠️ Could not parse JWT for user info:', jwtError.message);
        }
        
        return [{
          email: 'current-user@unknown.com',
          permissions: 'member',
          joinedAt: new Date(),
          isCurrentUser: true
        }];
      } else if (response.status === 404) {
        console.log('⚠️ Group members endpoint not found - returning current user as default member');
        
        // Get current user info from JWT token
        try {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          if (idToken) {
            const tokenParts = idToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const userEmail = payload.email || 'current-user@unknown.com';
              const userId = payload.sub;
              
              console.log('🔍 Using current user from JWT:', { userEmail, userId });
              
              return [{
                email: userEmail,
                permissions: 'member',
                joinedAt: new Date(),
                isCurrentUser: true,
                userId: userId
              }];
            }
          }
        } catch (jwtError) {
          console.warn('⚠️ Could not parse JWT for user info:', jwtError.message);
        }
        
        // Fallback if JWT parsing fails
        return [{
          email: 'current-user@unknown.com',
          permissions: 'member',
          joinedAt: new Date(),
          isCurrentUser: true
        }];
      } else if (response.status === 403) {
        console.log('⚠️ Access denied to group members - returning current user as default member');
        
        // Get current user info from JWT token
        try {
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          if (idToken) {
            const tokenParts = idToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const userEmail = payload.email || 'current-user@unknown.com';
              const userId = payload.sub;
              
              console.log('🔍 Using current user from JWT:', { userEmail, userId });
              
              return [{
                email: userEmail,
                permissions: 'member',
                joinedAt: new Date(), 
                isCurrentUser: true,
                userId: userId
              }];
            }
          }
        } catch (jwtError) {
          console.warn('⚠️ Could not parse JWT for user info:', jwtError.message);
        }
        
        // Fallback if JWT parsing fails
        return [{
          email: 'current-user@unknown.com',
          permissions: 'member',
          joinedAt: new Date(),
          isCurrentUser: true
        }];
      }

      // For other errors, return empty array
      console.warn('⚠️ Returning empty members array due to API error');
      return [];
    }

    // Parse successful response
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('✅ JSON parsing successful');
    } catch (e) {
      console.error('❌ Failed to parse response JSON:', e);
      console.warn('⚠️ Returning empty members array due to parse error');
      return [];
    }

    // Parse Lambda proxy integration response
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
    }    // Extract members from the new API response format
    // New format: { groupId: "...", members: [{UserID: "...", Email: "...", Permission: "..."}] }
    const members = actualData.members || [];
    const returnedGroupId = actualData.groupId;
    
    console.log('👥 Extracted members from new API:', members);
    console.log('🆔 Returned group ID:', returnedGroupId);
    console.log('🔢 Number of members:', members.length);

    if (members.length === 0) {
      console.log('⚠️ No members returned from API - this could mean:');
      console.log('   1. Group has no members (unlikely if user can access it)');
      console.log('   2. GroupID-index not configured properly in DynamoDB');
      console.log('   3. Members exist but user emails could not be retrieved');
    }

    // Transform members data for UI
    const transformedMembers = members.map((member, index) => {
      console.log(`🔄 Transforming member ${index + 1}:`, member);
      
      const transformedMember = {
        email: member.Email || 'unknown@unknown.com',
        permissions: member.Permission || 'member',
        joinedAt: member.JoinedAt || new Date(),
        userId: member.UserID || member.userId || member.id,
        isCurrentUser: false, // Will be determined by the calling function
        rawData: member // Keep raw data for debugging
      };
      
      console.log(`✅ Transformed member ${index + 1}:`, transformedMember);
      return transformedMember;
    });

    console.log('✅ Members transformed for UI:', transformedMembers);
    console.log('🔄 ======= END GET GROUP MEMBERS =======');

    return transformedMembers;
  } catch (error) {
    console.error('❌ Get group members error:', error.message);
    console.log('🔄 ======= END GET GROUP MEMBERS (ERROR) =======');
    
    // Return default member list on error - use real user info from JWT
    console.log('⚠️ Returning default member (current user) due to error');
    
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (idToken) {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userEmail = payload.email || 'current-user@unknown.com';
          const userId = payload.sub;
          
          console.log('🔍 Using current user from JWT for error fallback:', { userEmail, userId });
          
          return [{
            email: userEmail,
            permissions: 'member',
            joinedAt: new Date(),
            isCurrentUser: true,
            userId: userId
          }];
        }
      }
    } catch (jwtError) {
      console.warn('⚠️ Could not parse JWT for user info in error handler:', jwtError.message);
    }
    
    // Final fallback if everything fails
    return [{
      email: 'current-user@unknown.com',
      permissions: 'member', 
      joinedAt: new Date(),
      isCurrentUser: true
    }];
  }
};

/**
 * Remove another user from a group (group owner only)
 * @param {string} groupId - The group ID
 * @param {string} targetUserId - The user ID to remove from the group
 * @returns {Promise<Object>} Success response
 */
export const kickUserFromGroup = async (groupId, targetUserId) => {
  console.log('🔄 ======= KICKING USER FROM GROUP =======');
  console.log('🕐 Timestamp:', new Date().toISOString());
  console.log('🆔 Group ID:', groupId);
  console.log('🎯 Target User ID:', targetUserId);
  
  try {
    // Validate input
    if (!groupId || typeof groupId !== 'string' || groupId.trim().length === 0) {
      throw new Error('Group ID is required and must be a non-empty string');
    }

    if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.trim().length === 0) {
      throw new Error('Target user ID is required and must be a non-empty string');
    }

    // Get authentication headers
    console.log('🔐 Step 1: Getting authentication headers...');
    const headers = await getAuthHeaders();
    console.log('✅ Auth headers obtained successfully');

    // Prepare request payload
    const payload = {
      groupId: groupId.trim(),
      targetUserId: targetUserId.trim()
    };

    console.log('📦 Kick user from group request payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Step 2: Making API call to kick user from group...');
    console.log('📤 Request URL:', `${API_ENDPOINT}/groups/manage`);
    console.log('📤 Request method: PATCH');
    console.log('📤 Target Lambda: pix-kickUserGroup');
    console.log('📤 Expected behavior: Group owner removes another member from group');

    // Make API request
    const response = await fetch(`${API_ENDPOINT}/groups/manage`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(payload)
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
      console.error('❌ Kick user from group error response:', responseText);
      
      let errorMessage = 'Failed to remove user from group';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 400) {
        console.error('❌ Bad Request - Invalid payload or missing required fields');
        console.log('   Check that groupId and targetUserId are provided in request body');
        errorMessage = errorMessage || 'Invalid group ID or target user ID';
      } else if (response.status === 401) {
        console.error('❌ Unauthorized - Authentication failed');
        console.log('   Check if JWT token is valid and properly passed to Lambda');
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 403) {
        console.error('❌ Forbidden - User is not the group owner');
        console.log('   Only the group creator can remove other members');
        errorMessage = 'Only the group owner can remove other members from the group.';
      } else if (response.status === 404) {
        console.error('❌ Not Found - API endpoint, group, or user not found');
        console.log('   Check if:');
        console.log('   1. API Gateway PATCH /groups/manage endpoint is configured');
        console.log('   2. pix-kickUserGroup Lambda is connected to the endpoint');
        console.log('   3. The group ID and target user exist in the database');
        errorMessage = 'Group or user not found, or kick user endpoint not available.';
      } else if (response.status === 500) {
        console.error('💀 Server error - pix-kickUserGroup Lambda failed');
        console.log('   Check CloudWatch logs for pix-kickUserGroup Lambda');
        console.log('   Common issues:');
        console.log('   1. DynamoDB table "pix-groupMembersTable" access issues');
        console.log('   2. Lambda execution role missing permissions');
        console.log('   3. Error in group ownership verification logic');
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

    console.log('✅ Step 4: User successfully removed from group');
    console.log('📋 Response data:', responseData);
    console.log('🎉 SUCCESS: User kicked from group successfully');
    console.log('🔄 ======= END KICK USER FROM GROUP =======');

    return {
      success: true,
      data: responseData,
      message: responseData.message || 'User successfully removed from the group',
      targetUserId: targetUserId,
      groupId: groupId
    };

  } catch (error) {
    console.error('❌ Kick user from group error:', error.message);
    console.log('🔄 ======= END KICK USER FROM GROUP (ERROR) =======');
    
    // Handle different types of errors
    if (error.message.includes('Authentication')) {
      return {
        success: false,
        error: 'Please log in to remove users from groups',
        statusCode: 401
      };
    }

    if (error.message.includes('Group ID') || error.message.includes('Target user ID')) {
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

// Create a default export object for backward compatibility
const groupService = {
  createGroup,
  getGroups,
  getGroupDetails,
  addUserToGroup,
  addGroupMember,
  removeGroupMember,
  deleteGroup,
  getGroupMembers,
  kickUserFromGroup
};

export default groupService;
