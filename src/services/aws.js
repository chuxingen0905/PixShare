import { Amplify } from 'aws-amplify';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import awsconfig from '../aws-exports.js';
import authService from './auth.js';

// Configure Amplify
Amplify.configure(awsconfig);

class AWSService {  // Photo Management with S3 using Identity Pool credentials
  async uploadPhoto(file, metadata = {}) {
    try {
      // Make sure we have valid credentials before S3 operations
      await authService.ensureValidToken();

      const filename = `photos/${Date.now()}-${file.name}`;

      // Upload file to S3
      const result = await uploadData({
        key: filename,
        data: file,
        options: {
          contentType: file.type,
          metadata: {
            userId: metadata.userId || 'anonymous',
            description: metadata.description || '',
            isPublic: metadata.isPublic ? 'true' : 'false'
          }
        }
      }).result;

      // Get the URL for the uploaded file
      const urlResult = await this.getPhotoUrl(filename);

      // Create photo metadata object
      const photoData = {
        id: filename,
        name: file.name,
        key: filename,
        size: file.size,
        type: file.type,
        url: urlResult,
        description: metadata.description || '',
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        sharedWith: metadata.sharedWith || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: metadata.owner || ''
      };

      // Store in browser storage
      this.storePhotoMetadata(photoData);

      return photoData;
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Fallback: Store photo in localStorage if S3 upload fails
      return this.uploadPhotoLocally(file, metadata);
    }
  }

  // Helper method to convert file to data URL
  async fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Store photo metadata in local storage
  storePhotoMetadata(photoData) {
    try {
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');
      photos.push(photoData);
      localStorage.setItem('photos', JSON.stringify(photos));
    } catch (error) {
      console.error('Error storing photo metadata:', error);
    }
  }
  // Get photos from a combination of S3 and local storage
  async getPhotos({ limit = 100, nextToken = null } = {}) {
    try {
      // First, get local metadata about all photos
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');

      // For photos stored in S3 (non-local), refresh their URLs
      for (let i = 0; i < photos.length; i++) {
        if (!photos[i].isLocalOnly && photos[i].key) {
          try {
            photos[i].url = await this.getPhotoUrl(photos[i].key);
          } catch (error) {
            console.warn(`Could not refresh URL for photo ${photos[i].key}:`, error);
          }
        }
      }

      return {
        items: photos.slice(0, limit),
        nextToken: photos.length > limit ? 'more' : null
      };
    } catch (error) {
      console.error('Error fetching photos:', error);
      return { items: [], nextToken: null };
    }
  }
  // Get a single photo by ID
  async getPhoto(id) {
    try {
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');
      const photo = photos.find(photo => photo.id === id || photo.key === id);

      // If it's an S3 photo, refresh the URL
      if (photo && !photo.isLocalOnly && photo.key) {
        try {
          photo.url = await this.getPhotoUrl(photo.key);
        } catch (error) {
          console.warn(`Could not refresh URL for photo ${photo.key}:`, error);
        }
      }

      return photo || null;
    } catch (error) {
      console.error('Error fetching photo:', error);
      return null;
    }
  }

  // Get photo URL from S3
  async getPhotoUrl(key) {
    try {
      // Check if this is a local-only photo
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');
      const photo = photos.find(p => p.key === key);
      if (photo?.isLocalOnly && photo?.dataUrl) {
        return photo.dataUrl;
      }

      // Otherwise get from S3
      await authService.ensureValidToken();

      const result = await getUrl({
        key,
        options: {
          expiresIn: 3600 // URL expires in 1 hour
        }
      });

      return result.url.toString();
    } catch (error) {
      console.error('Error getting photo URL:', error);
      throw error;
    }
  }
  // Delete photo (from S3 and/or local storage)
  async deletePhoto(id) {
    try {
      // Find the photo in local metadata
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');
      const photoIndex = photos.findIndex(p => p.id === id);

      if (photoIndex === -1) {
        throw new Error('Photo not found');
      }

      const photo = photos[photoIndex];

      // If it's in S3, delete from there
      if (!photo.isLocalOnly && photo.key) {
        try {
          // Make sure we have valid credentials
          await authService.ensureValidToken();

          // Delete from S3
          await remove({ key: photo.key });
        } catch (s3Error) {
          console.error('Error deleting from S3:', s3Error);
          // Continue with local deletion even if S3 deletion fails
        }
      }

      // Remove from local storage metadata
      photos.splice(photoIndex, 1);
      localStorage.setItem('photos', JSON.stringify(photos));

      return { id };
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  // Update photo metadata
  async updatePhoto(id, updates) {
    try {
      const photos = JSON.parse(localStorage.getItem('photos') || '[]');
      const photoIndex = photos.findIndex(p => p.id === id);

      if (photoIndex === -1) {
        throw new Error('Photo not found');
      }

      // Update photo data
      photos[photoIndex] = {
        ...photos[photoIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('photos', JSON.stringify(photos));
      return photos[photoIndex];
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  }

  // User Management - Local implementation
  async createUserProfile(userData) {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const newUser = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name || '',
        avatar: userData.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      return newUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserProfile(userId) {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Fallback: Store photo in localStorage if S3 upload fails
  async uploadPhotoLocally(file, metadata = {}) {
    try {
      const key = `local_photos/${Date.now()}-${file.name}`;

      // Convert file to data URL for local storage
      const dataUrl = await this.fileToDataUrl(file);

      // Create photo metadata
      const photoData = {
        id: Date.now().toString(),
        name: file.name,
        key: key,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl, // Store the image data directly
        description: metadata.description || '',
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        sharedWith: metadata.sharedWith || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: metadata.owner || '',
        isLocalOnly: true // Flag to indicate this is stored locally only
      };

      // Store in local storage
      this.storePhotoMetadata(photoData);

      return photoData;
    } catch (error) {
      console.error('Error with local photo upload fallback:', error);
      throw error;
    }
  }
}

export default new AWSService();
