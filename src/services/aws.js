import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import awsconfig from '../aws-exports.js';

// Configure Amplify
Amplify.configure(awsconfig);

// Create API client
const client = generateClient();

// GraphQL queries and mutations
const queries = {
  listPhotos: /* GraphQL */ `
    query ListPhotos($filter: ModelPhotoFilterInput, $limit: Int, $nextToken: String) {
      listPhotos(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          name
          key
          size
          type
          description
          tags
          isPublic
          sharedWith
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
    }
  `,
  
  getPhoto: /* GraphQL */ `
    query GetPhoto($id: ID!) {
      getPhoto(id: $id) {
        id
        name
        key
        size
        type
        description
        tags
        isPublic
        sharedWith
        createdAt
        updatedAt
        owner
      }
    }
  `,
  
  createPhoto: /* GraphQL */ `
    mutation CreatePhoto($input: CreatePhotoInput!) {
      createPhoto(input: $input) {
        id
        name
        key
        size
        type
        description
        tags
        isPublic
        sharedWith
        createdAt
        updatedAt
        owner
      }
    }
  `,
  
  updatePhoto: /* GraphQL */ `
    mutation UpdatePhoto($input: UpdatePhotoInput!) {
      updatePhoto(input: $input) {
        id
        name
        key
        size
        type
        description
        tags
        isPublic
        sharedWith
        createdAt
        updatedAt
        owner
      }
    }
  `,
  
  deletePhoto: /* GraphQL */ `
    mutation DeletePhoto($input: DeletePhotoInput!) {
      deletePhoto(input: $input) {
        id
      }
    }
  `,
  
  listUsers: /* GraphQL */ `
    query ListUsers($filter: ModelUserFilterInput, $limit: Int, $nextToken: String) {
      listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          email
          name
          avatar
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  `,
  
  createUser: /* GraphQL */ `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        email
        name
        avatar
        createdAt
        updatedAt
      }
    }
  `
};

class AWSService {
  // Photo Management
  async uploadPhoto(file, metadata = {}) {
    try {
      const key = `photos/${Date.now()}-${file.name}`;
      
      // Upload file to S3
      const result = await uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            ...metadata
          }
        }
      }).result;
      
      // Create photo record in database
      const photoData = {
        name: file.name,
        key: result.key,
        size: file.size,
        type: file.type,
        description: metadata.description || '',
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        sharedWith: metadata.sharedWith || []
      };
      
      const response = await client.graphql({
        query: queries.createPhoto,
        variables: { input: photoData }
      });
      
      return response.data.createPhoto;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }
  
  async getPhotos(filter = {}, limit = 100) {
    try {
      const response = await client.graphql({
        query: queries.listPhotos,
        variables: { filter, limit }
      });
      
      // Get download URLs for each photo
      const photosWithUrls = await Promise.all(
        response.data.listPhotos.items.map(async (photo) => {
          try {
            const url = await getUrl({ key: photo.key });
            return {
              ...photo,
              url: url.url.toString()
            };
          } catch (error) {
            console.error('Error getting URL for photo:', photo.key, error);
            return {
              ...photo,
              url: null
            };
          }
        })
      );
      
      return photosWithUrls;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }
  
  async getPhoto(id) {
    try {
      const response = await client.graphql({
        query: queries.getPhoto,
        variables: { id }
      });
      
      const photo = response.data.getPhoto;
      if (photo) {
        const url = await getUrl({ key: photo.key });
        return {
          ...photo,
          url: url.url.toString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  }
  
  async updatePhoto(id, updates) {
    try {
      const response = await client.graphql({
        query: queries.updatePhoto,
        variables: { 
          input: { 
            id, 
            ...updates 
          } 
        }
      });
      
      return response.data.updatePhoto;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  }
  
  async deletePhoto(id, key) {
    try {
      // Delete from S3
      await remove({ key });
      
      // Delete from database
      const response = await client.graphql({
        query: queries.deletePhoto,
        variables: { input: { id } }
      });
      
      return response.data.deletePhoto;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
  
  async searchPhotos(searchTerm, filter = {}) {
    try {
      const searchFilter = {
        ...filter,
        or: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { tags: { contains: searchTerm } }
        ]
      };
      
      return await this.getPhotos(searchFilter);
    } catch (error) {
      console.error('Error searching photos:', error);
      throw error;
    }
  }
  
  // User Management
  async createUserProfile(userData) {
    try {
      const response = await client.graphql({
        query: queries.createUser,
        variables: { input: userData }
      });
      
      return response.data.createUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  async getUsers() {
    try {
      const response = await client.graphql({
        query: queries.listUsers
      });
      
      return response.data.listUsers.items;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  // Share Management
  async sharePhoto(photoId, userEmails, permissions = { view: true }) {
    try {
      const updates = {
        sharedWith: userEmails,
        isPublic: userEmails.length === 0 // If sharing with specific users, make it not public
      };
      
      return await this.updatePhoto(photoId, updates);
    } catch (error) {
      console.error('Error sharing photo:', error);
      throw error;
    }
  }
  
  async getSharedPhotos(userEmail) {
    try {
      const filter = {
        or: [
          { isPublic: { eq: true } },
          { sharedWith: { contains: userEmail } }
        ]
      };
      
      return await this.getPhotos(filter);
    } catch (error) {
      console.error('Error fetching shared photos:', error);
      throw error;
    }
  }
}

export default new AWSService();
