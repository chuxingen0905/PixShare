import authService from './auth.js';

class ApiService {
        constructor() {
            this.baseUrl = 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment';

            this.endpoints = {
                photos: {
                    base: '/photos',
                    byId: (id) => `/photos/${id}`,
                    search: '/photos/search'
                },
                groups: {
                    base: '/groups',
                    manage: '/groups/manage',
                    users: '/groups/users' 
                },
                profile: {
                    base: '/profile',
                    content: '/profile/content',
                    images: '/profile/images'
                },
                users: {
                    profile: '/users/profile',
                    preferences: '/users/preferences'
                },
                auth: {
                    refreshToken: '/auth/refresh-token'
                }
            };
        }


    // Get headers for API calls with authentication
    async getHeaders() {
        // Ensure token is valid before making the request
        await authService.ensureValidToken();

        // Get fresh auth header
        const authHeader = authService.getAuthHeader();

        return {
            'Content-Type': 'application/json',
            ...authHeader
        };
    }

    // Generic API request method
        async request(endpoint, method = 'GET', data = null) {
            try {
                const url = `${this.baseUrl}${endpoint}`;
                const headers = await this.getHeaders();

                const options = {
                    method,
                    headers,
                    credentials: 'include'
                };

                if (data && method !== 'GET') {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(url, options);

                // Handle 401 token expiration
                if (response.status === 401) {
                    const refreshed = await authService.refreshSession();
                    if (refreshed) {
                        return this.request(endpoint, method, data); // retry
                    } else {
                        throw new Error('Authentication failed');
                    }
                }

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }

                return await response.text();
            } catch (error) {
                console.error(`API ${method} request to ${endpoint} failed:`, error);
                throw error;
            }
        }


    // Get all photos
    async getPhotos(limit = 100, nextToken = null) {
        let endpoint = this.endpoints.photos.base;
        const queryParams = [];

        if (limit) {
            queryParams.push(`limit=${limit}`);
        }

        if (nextToken) {
            queryParams.push(`nextToken=${encodeURIComponent(nextToken)}`);
        }

        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }

        return this.request(endpoint);
    }

    // Get a single photo
    async getPhoto(id) {
        return this.request(this.endpoints.photos.byId(id));
    }

    // Update photo metadata
    async updatePhoto(id, metadata) {
        return this.request(this.endpoints.photos.byId(id), 'PUT', metadata);
    }

    // Delete a photo
    async deletePhoto(id) {
        return this.request(this.endpoints.photos.byId(id), 'DELETE');
    }

    // Helper: Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    // Share a photo with specific users or groups
    async sharePhoto(photoId, shareSettings) {
        return this.request(this.endpoints.photos.share(photoId), 'POST', shareSettings);
    }

    // Search photos with filters
    async searchPhotos(searchParams) {
        return this.request(this.endpoints.photos.search, 'POST', searchParams);
    }

    // Get user profile
    async getUserProfile() {
        return this.request(this.endpoints.users.profile);
    }

    // Update user profile
    async updateUserProfile(profileData) {
        return this.request(this.endpoints.users.profile, 'PUT', profileData);
    }
}
const apiService = new ApiService();

export default new ApiService();
