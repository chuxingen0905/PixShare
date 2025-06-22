<template>
  <div class="group-management">    <!-- Create Group Folder -->
    <div class="mb-8 p-6 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Create New Group Folder</h2>
      
      <!-- Success Message -->
      <div v-if="createGroupSuccess" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ createGroupSuccess }}
      </div>
      
      <!-- Error Message -->
      <div v-if="createGroupError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ createGroupError }}
      </div>
      
      <div class="flex gap-4">
        <input
          v-model="newGroupName"
          type="text"
          placeholder="Group folder name"
          maxlength="50"
          class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :disabled="isCreatingGroup"
          @keyup.enter="createGroup"
        >
        <button
          @click="createGroup"
          :disabled="isCreatingGroup || !newGroupName.trim()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <svg v-if="isCreatingGroup" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isCreatingGroup ? 'Creating...' : 'Create' }}
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-2">{{ newGroupName.length }}/50 characters</p>
    </div>    <!-- Group List -->
    <div class="mb-8" v-if="groups.length > 0">
      <h2 class="text-xl font-semibold mb-4">Your Group Folders</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">        <div
          v-for="group in groups"
          :key="group.id"
          @click="navigateToGroupPhotos(group)"
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer group"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-medium text-lg group-hover:text-blue-600 transition">{{ group.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ group.memberCount || group.members?.length || '1' }} member(s)
              </p>
              <p class="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition">
                Click to view group photos →
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click.stop="openEditGroup(group)"
                class="text-gray-500 hover:text-blue-600"
                title="Edit group"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="deleteGroup(group.id)"
                class="text-gray-500 hover:text-red-600"
                title="Delete group"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="mb-8 p-8 bg-white rounded-lg shadow text-center">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
      <p class="text-gray-500 mb-4">Create your first group folder to start organizing and sharing photos with others.</p>
      <p class="text-sm text-gray-400">The groups listing feature may not be fully implemented yet, but you can still create new groups using the form above.</p>
    </div>

    <!-- Group Edit Modal -->
    <div v-if="editingGroup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Manage Group: {{ editingGroup.name }}</h2>
            <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Add Members -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Add Members</h3>
            <div class="flex gap-2">
              <input
                v-model="newMemberEmail"
                type="email"
                placeholder="Enter member email"
                class="flex-1 px-4 py-2 border rounded-lg"
              >              <button
                @click="addMember"
                :disabled="isAddingMember || !newMemberEmail.trim()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <svg v-if="isAddingMember" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isAddingMember ? 'Adding...' : 'Add' }}
              </button>
            </div>
          </div>

          <!-- Members List -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Current Members</h3>
            <div v-if="editingGroup.members.length === 0" class="text-gray-500 text-sm">
              No members added yet
            </div>
            <ul v-else class="divide-y">              <li v-for="member in editingGroup.members" :key="member.email" class="py-3 flex justify-between items-center">
                <div>
                  <p class="font-medium">
                    {{ member.email }}
                    <span v-if="member.isCurrentUser" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      You
                    </span>                    <span v-if="member.permissions === 'owner' || member.permissions === 'Owner'" class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Owner
                    </span>
                  </p>
                  <p class="text-xs text-gray-500">Joined {{ formatDate(member.joinedAt) }}</p>
                </div><div class="flex items-center">
                  <button
                    @click="removeMember(member.email)"
                    class="text-red-500 hover:text-red-700"
                    :title="member.isCurrentUser ? 'Leave group' : 'Remove member'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>          
          <div class="flex justify-between items-center pt-4 border-t">
            <!-- Leave Group Button (left side) -->
            <button
              @click="leaveCurrentGroup"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              title="Leave this group"
            >
              Leave Group
            </button>
            
            <!-- Cancel and Save buttons (right side) -->
            <div class="flex gap-2">
              <button
                @click="closeEditModal"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                @click="saveGroupChanges"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import groupService, { addUserToGroup, getGroupMembers, removeGroupMember, kickUserFromGroup } from '../services/groupService.js';
import { fetchAuthSession } from 'aws-amplify/auth';

export default {
  name: 'GroupManagement',  data() {
    return {
      newGroupName: '',
      newMemberEmail: '',
      groups: [],
      editingGroup: null,
      isCreatingGroup: false,
      isAddingMember: false,
      createGroupError: '',
      createGroupSuccess: ''
    }
  },
  
  methods: {
    navigateToGroupPhotos(group) {
      console.log('📁 Navigating to group photos:', group);
      this.$router.push({
        name: 'GroupPhotos',
        params: { groupId: group.id || group.groupId },
        query: { 
          groupName: group.name,
          groupDescription: group.description || ''
        }
      });
    },
    
    async createGroup() {
      if (!this.newGroupName.trim()) {
        this.createGroupError = 'Group name is required';
        return;
      }

      try {
        this.isCreatingGroup = true;
        this.createGroupError = '';
        this.createGroupSuccess = '';
        
        console.log('Creating group via GroupManagement:', this.newGroupName);

        // Call the real API
        const result = await groupService.createGroup(this.newGroupName.trim());

        if (result.success) {
          this.createGroupSuccess = result.message || 'Group created successfully!';
          console.log('✅ Group created:', result.group);          // Add the new group to the local list with consistent formatting
          const newGroup = {
            id: result.group.GrpID,
            groupId: result.group.GrpID,
            name: result.group.GroupName, // Use actual name from creation
            description: result.group.Description || 'No description provided',
            memberCount: '1', // Creator is the first member
            members: [], // Initialize empty members array for template compatibility
            role: 'owner', // Creator has owner role
            createdAt: result.group.CreatedAt,
            isLimitedData: false // This has full data from creation
          };
          
          this.groups.push(newGroup);
          this.newGroupName = '';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.createGroupSuccess = '';
          }, 3000);
          
        } else {
          this.createGroupError = result.error || 'Failed to create group';
          console.error('❌ Group creation failed:', result.error);
        }

      } catch (error) {
        this.createGroupError = error.message || 'An unexpected error occurred';
        console.error('❌ Group creation error:', error);
      } finally {
        this.isCreatingGroup = false;
      }
    },    async openEditGroup(group) {
      console.log('🔄 Opening group for editing:', group);
      this.editingGroup = JSON.parse(JSON.stringify(group));
      
      // Fetch fresh member data for this group
      try {
        console.log('🚀 Fetching fresh member data for group:', group.id);
        const members = await getGroupMembers(group.id);
        
        if (members && members.length > 0) {          // Get current user info to identify which member is the current user
          try {
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();
            
            if (idToken) {
              const tokenParts = idToken.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const currentUserEmail = payload.email;
                const currentUserId = payload.sub;
                
                console.log('👤 Current user info:', { currentUserEmail, currentUserId });
                
                // Mark the current user in the members list
                members.forEach(member => {
                  if (member.email === currentUserEmail || member.userId === currentUserId) {
                    member.isCurrentUser = true;
                    console.log('✅ Found current user in members list:', member.email);
                  }
                });
              }
            }
          } catch (authError) {
            console.warn('⚠️ Could not get current user info:', authError.message);
          }
          
          // Enhanced debugging for member data
          console.log('🔍 DETAILED MEMBER DEBUG INFO:');
          members.forEach((member, index) => {
            console.log(`Member ${index + 1}:`, {
              email: member.email,
              permissions: member.permissions,
              userId: member.userId,
              isCurrentUser: member.isCurrentUser,
              rawData: member.rawData,
              allFields: Object.keys(member)
            });
          });
          
          this.editingGroup.members = members;
          console.log('✅ Updated group members:', members);
        } else {
          console.log('⚠️ No members returned, keeping existing member data');
        }
      } catch (error) {
        console.error('❌ Error fetching group members:', error);
        console.log('ℹ️ Keeping existing member data due to error');
      }
    },
    
    closeEditModal() {
      this.editingGroup = null
      this.newMemberEmail = ''
    },
    
    saveGroupChanges() {
      const index = this.groups.findIndex(g => g.id === this.editingGroup.id)
      if (index !== -1) {
        this.groups.splice(index, 1, this.editingGroup)
      }
      this.closeEditModal()
    },
    
    deleteGroup(groupId) {
      this.groups = this.groups.filter(g => g.id !== groupId)
    },
      async addMember() {
      if (!this.newMemberEmail.trim() || !this.validateEmail(this.newMemberEmail)) {
        console.log('⚠️ Invalid email provided for adding member');
        return;
      }
      
      const email = this.newMemberEmail.trim().toLowerCase();
      const exists = this.editingGroup.members.some(m => m.email === email);
        if (exists) {
        console.log('⚠️ Member already exists in the group');
        alert('This member is already in the group.');
        return;
      }

      console.log('🔄 Adding member to group via API...');
      console.log('📧 Email:', email);
      console.log('🆔 Group ID:', this.editingGroup.id);
      
      this.isAddingMember = true;      try {
        // Call the API to add the user with the specified email to the group
        const result = await addUserToGroup(this.editingGroup.id, email, 'member');
        
        if (result.success) {
          console.log('✅ User added to group successfully via API');
          
          // Add to local UI (this is just for display, the real membership is handled by the API)
          this.editingGroup.members.push({
            email: email, // Display email (for UI purposes)
            permissions: 'view',
            joinedAt: new Date()
          });
          
          this.newMemberEmail = '';
          
          // Show success message
          alert('Member added successfully!');
          
        } else {
          console.error('❌ Failed to add member via API:', result.error);
          alert(`Failed to add member: ${result.error}`);
        }
          } catch (error) {
        console.error('❌ Error adding member:', error);
        alert('An error occurred while adding the member. Please try again.');
      } finally {
        this.isAddingMember = false;
      }
    },    async removeMember(email) {
      // Check if removing current user (leaving group)
      const member = this.editingGroup.members.find(m => m.email === email);
      const isCurrentUser = member?.isCurrentUser;
      const currentUserMember = this.editingGroup.members.find(m => m.isCurrentUser);
      const isCurrentUserOwner = currentUserMember?.permissions === 'owner' || currentUserMember?.permissions === 'Owner';
      
      console.log('🔍 Remove member debug info:');
      console.log('   Target email:', email);
      console.log('   Is current user:', isCurrentUser);
      console.log('   Current user member data:', currentUserMember);
      console.log('   Current user permissions:', currentUserMember?.permissions);
      console.log('   Is current user owner:', isCurrentUserOwner);
      console.log('   All members:', this.editingGroup.members);
      
      // Confirm removal/leave action
      const action = isCurrentUser ? 'leave this group' : 'remove this member';
      if (!confirm(`Are you sure you want to ${action}?`)) {
        return;
      }
      
      if (isCurrentUser) {
        // Current user is leaving the group
        console.log('🚪 Current user leaving group:', this.editingGroup.id);
        console.log('👑 Current user is owner:', isCurrentUserOwner);
        
        let newOwnerId = null;
        
        // If current user is owner and there are other members, need to transfer ownership
        if (isCurrentUserOwner && this.editingGroup.members.length > 1) {
          console.log('🔄 Owner leaving group with other members - need to transfer ownership');
          
          // Find another member to make owner (first non-current-user member)
          const otherMembers = this.editingGroup.members.filter(m => !m.isCurrentUser);
            if (otherMembers.length > 0) {
            const newOwner = otherMembers[0];
            newOwnerId = newOwner.userId || newOwner.UserID || newOwner.id;
            
            console.log('👑 Selected new owner:', newOwner.email);
            console.log('🔍 Available ID fields:', {
              userId: newOwner.userId,
              UserID: newOwner.UserID,
              id: newOwner.id,
              rawData: newOwner.rawData
            });
            console.log('👑 Selected ID:', newOwnerId);
              // Ask for confirmation about ownership transfer
            if (newOwnerId && !confirm(`You are the group owner. Leaving will transfer ownership to ${newOwner.email}. Continue?`)) {
              return;
            }
            
            // If still no ID found, try to extract from rawData
            if (!newOwnerId && newOwner.rawData) {
              newOwnerId = newOwner.rawData.UserID || newOwner.rawData.userId || newOwner.rawData.ID;
              console.log('👑 Trying ID from rawData:', newOwnerId);
            }
            
            // Final fallback - use email as ID (some systems accept this)
            if (!newOwnerId) {
              newOwnerId = newOwner.email;
              console.log('👑 Using email as fallback ID:', newOwnerId);
            }
          } else {
            console.warn('⚠️ No other members found to transfer ownership to');
          }
        }        // IMPORTANT: Always transfer ownership if there are other members, regardless of detected owner status
        // The backend will determine if ownership transfer is needed
        if (!newOwnerId && this.editingGroup.members.length > 1) {
          console.log('🔄 Auto-selecting new owner as safety measure');
          const otherMembers = this.editingGroup.members.filter(m => !m.isCurrentUser);
          if (otherMembers.length > 0) {
            const selectedMember = otherMembers[0];
            newOwnerId = selectedMember.userId || selectedMember.UserID || selectedMember.id;
            console.log('👑 Auto-selected new owner:', selectedMember.email);
            console.log('🔍 Available ID fields:', {
              userId: selectedMember.userId,
              UserID: selectedMember.UserID,
              id: selectedMember.id,
              rawData: selectedMember.rawData
            });
            console.log('👑 Selected ID:', newOwnerId);
            
            // If still no ID found, try to extract from rawData
            if (!newOwnerId && selectedMember.rawData) {
              newOwnerId = selectedMember.rawData.UserID || selectedMember.rawData.userId || selectedMember.rawData.ID;
              console.log('👑 Trying ID from rawData:', newOwnerId);
            }
            
            // Final fallback - use email as ID (some systems accept this)
            if (!newOwnerId) {
              newOwnerId = selectedMember.email;
              console.log('👑 Using email as fallback ID:', newOwnerId);
            }
          }
        }
        
        try {
          console.log('🚀 Calling removeGroupMember with:', {
            groupId: this.editingGroup.id,
            newOwnerId: newOwnerId
          });
          
          const result = await removeGroupMember(this.editingGroup.id, newOwnerId);
          
          if (result.success) {
            console.log('✅ Successfully left group');
            
            // Show success message
            let message = 'You have successfully left the group.';
            if (result.isLastMember) {
              message = 'You have left the group and were the last member. The group folder has been deleted.';
            } else if (newOwnerId) {
              const newOwnerEmail = this.editingGroup.members.find(m => m.userId === newOwnerId)?.email;
              message = `You have left the group. Ownership has been transferred to ${newOwnerEmail}.`;
            }
              alert(message);
            
            // Close modal and refresh groups list
            this.closeEditModal();
            await this.loadGroups();
            
          } else {
            console.error('❌ Failed to leave group:', result.error);
            alert(`Failed to leave group: ${result.error}`);
          }
          
        } catch (error) {
          console.error('❌ Error leaving group:', error);
          
          // Check if error is about missing newOwnerId
          if (error.message && error.message.includes('newOwnerId')) {
            alert('As the group owner, you must transfer ownership to another member before leaving. Please try again.');
          } else {
            alert('An error occurred while leaving the group. Please try again.');
          }
        }
          } else {
        // Group owner removing another member
        console.log('👮 Group owner removing member:', email, 'from group:', this.editingGroup.id);
        
        try {
          // Get the target user's ID
          const targetUserId = member?.userId;
          if (!targetUserId) {
            alert('Cannot remove member: User ID not found. Please refresh and try again.');
            return;
          }
          
          console.log('🎯 Target user ID:', targetUserId);
          
          const result = await kickUserFromGroup(this.editingGroup.id, targetUserId);
          
          if (result.success) {
            console.log('✅ Successfully removed member from group');
            
            // Show success message
            alert(`Successfully removed ${email} from the group.`);
            
            // Remove member from local UI
            this.editingGroup.members = this.editingGroup.members.filter(m => m.email !== email);
            
            // Optionally refresh member data from server
            try {
              const updatedMembers = await getGroupMembers(this.editingGroup.id);
              if (updatedMembers && updatedMembers.length > 0) {
                // Re-identify current user in updated member list
                const session = await fetchAuthSession();
                const idToken = session.tokens?.idToken?.toString();
                
                if (idToken) {
                  const tokenParts = idToken.split('.');
                  if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const currentUserEmail = payload.email;
                    const currentUserId = payload.sub;
                    
                    updatedMembers.forEach(m => {
                      if (m.email === currentUserEmail || m.userId === currentUserId) {
                        m.isCurrentUser = true;
                      }
                    });
                  }
                }
                
                this.editingGroup.members = updatedMembers;
                console.log('✅ Refreshed member list from server');
              }
            } catch (refreshError) {
              console.warn('⚠️ Could not refresh member list:', refreshError.message);
            }
            
          } else {
            console.error('❌ Failed to remove member from group:', result.error);
            alert(`Failed to remove member: ${result.error}`);
          }
          
        } catch (error) {
          console.error('❌ Error removing member from group:', error);
          alert('An error occurred while removing the member. Please try again.');
        }
      }    },
    
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },
      formatDate(date) {
      return new Date(date).toLocaleDateString()
    },    async loadGroups() {
      try {
        console.log('Loading groups...');
        const groups = await groupService.getGroups();
        console.log('Groups loaded:', groups);
        
        // Check if we got an array (successful response or graceful fallback)
        if (Array.isArray(groups)) {
          // Transform the API response to match the component's expected format
          this.groups = groups.map(group => ({
            id: group.GrpID || group.id,
            name: group.GroupName || group.name,
            description: group.Description || group.description,
            members: group.members || [],
            permissions: group.permissions || {
              upload: false,
              delete: false,
              share: false
            },
            createdAt: group.CreatedAt || group.createdAt
          }));
          
          if (groups.length === 0) {
            console.log('✅ No existing groups found (empty array returned)');
          } else {
            console.log(`✅ Loaded ${groups.length} groups successfully`);
          }
        } else {
          console.warn('⚠️ Unexpected response format from getGroups:', groups);
          this.groups = [];
        }
      } catch (error) {
        console.error('❌ Failed to load groups:', error);
        // Keep empty array if loading fails
        this.groups = [];
        console.log('ℹ️ Starting with empty groups list - you can still create new groups');
      }
    },    async leaveCurrentGroup() {
      if (!this.editingGroup) {
        return;
      }
      
      const currentUserMember = this.editingGroup.members.find(m => m.isCurrentUser);
      const isCurrentUserOwner = currentUserMember?.permissions === 'owner' || currentUserMember?.permissions === 'Owner';
      
      console.log('� Leave group debug info:');
      console.log('   Current user member data:', currentUserMember);
      console.log('   Current user permissions:', currentUserMember?.permissions);
      console.log('   Is current user owner:', isCurrentUserOwner);
      console.log('   Total members:', this.editingGroup.members.length);
      
      let newOwnerId = null;
      
      // IMPORTANT: Always transfer ownership if there are other members, regardless of detected owner status
      // The backend will determine if ownership transfer is needed
      if (this.editingGroup.members.length > 1) {
        console.log('🔄 Multiple members detected - preparing ownership transfer');
        
        // Find another member to make owner (first non-current-user member)
        const otherMembers = this.editingGroup.members.filter(m => !m.isCurrentUser);        if (otherMembers.length > 0) {
          const newOwner = otherMembers[0];
          
          console.log('🎯 Selected member for ownership:', newOwner);
          console.log('🔍 Available ID fields:', {
            userId: newOwner.userId,
            UserID: newOwner.UserID,
            id: newOwner.id,
            rawData: newOwner.rawData,
            allFields: Object.keys(newOwner)
          });
          
          // Try multiple ID sources
          newOwnerId = newOwner.userId || newOwner.UserID || newOwner.id;
          console.log('🔍 First attempt - found ID:', newOwnerId);
          
          // If still no ID found, try to extract from rawData
          if (!newOwnerId && newOwner.rawData) {
            newOwnerId = newOwner.rawData.UserID || newOwner.rawData.userId || newOwner.rawData.ID;
            console.log('🔍 Second attempt from rawData - found ID:', newOwnerId);
          }
          
          // Try other possible field names
          if (!newOwnerId) {
            newOwnerId = newOwner.user_id || newOwner.USER_ID || newOwner.sub;
            console.log('🔍 Third attempt with other field names - found ID:', newOwnerId);
          }
            // IMPORTANT: If we still don't have an ID, we need to fetch it differently
          // The backend API isn't returning UserID, so we need to work around this
          if (!newOwnerId) {
            console.log('⚠️ No user ID found for other member, trying alternative approach...');
            
            // Since we know the current user's ID and there are only 2 members,
            // let's try to call the group members API differently or use another approach
            try {
              // Get current user ID from JWT
              const session = await fetchAuthSession();
              const idToken = session.tokens?.idToken?.toString();
              if (idToken) {
                const tokenParts = idToken.split('.');
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(atob(tokenParts[1]));
                  const currentUserId = payload.sub;
                  
                  console.log('🔍 Current user ID from JWT:', currentUserId);
                  console.log('🔍 Need to find ID for:', newOwner.email);
                  
                  // Try calling the add user API with the email to get the user ID
                  // This might return the user ID even if the user is already in the group
                  console.log('🔄 Attempting to get user ID via addUserToGroup API...');
                  
                  try {
                    // Try to add the user (they're already in the group, but API might return their ID)
                    const addResult = await addUserToGroup(this.editingGroup.id, newOwner.email, 'member');
                    console.log('📋 AddUserToGroup result:', addResult);
                    
                    // If this gives us any user ID information, use it
                    if (addResult && addResult.userId) {
                      newOwnerId = addResult.userId;
                      console.log('✅ Got user ID from addUserToGroup:', newOwnerId);
                    }
                  } catch (addError) {
                    console.log('⚠️ AddUserToGroup failed (expected if user already exists):', addError.message);
                    
                    // If it fails because user already exists, that's expected
                    // Let's try a different approach - generate a predictable user ID pattern
                    // or ask the user to provide the ID manually
                  }                    // If we still don't have an ID, let's try one more approach
                    if (!newOwnerId) {
                      console.log('🔄 Last resort: prompting user for owner ID...');
                      
                      // Show a dialog asking the user if they want to proceed without ownership transfer
                      // or if they know the other user's ID
                      const userChoice = confirm(
                        `Cannot automatically transfer ownership to ${newOwner.email} due to missing user ID.\n\n` +
                        `Options:\n` +
                        `• Click "OK" to leave anyway (other member may need to create a new group)\n` +
                        `• Click "Cancel" to stay in the group\n\n` +
                        `Note: This is a technical limitation that requires backend API improvements.`
                      );
                      
                      if (!userChoice) {
                        console.log('🚫 User chose to cancel leaving the group');
                        return; // User chose to stay in the group
                      }
                      
                      // User chose to leave anyway - proceed without ownership transfer
                      // This might fail if the backend requires ownership transfer
                      console.log('⚠️ Proceeding to leave group without ownership transfer as per user choice');
                      newOwnerId = null;
                    }
                }
              }
            } catch (jwtError) {
              console.warn('⚠️ Could not get current user info from JWT:', jwtError);
              alert('Unable to process ownership transfer due to authentication issues. Please try logging out and back in.');
              return;
            }
          }
          
          console.log('👑 FINAL Selected new owner:', newOwner.email, 'ID:', newOwnerId);
            // Ask for confirmation about potential ownership transfer
          if (newOwnerId) {
            if (!confirm(`Leaving "${this.editingGroup.name}" will transfer ownership to ${newOwner.email}. Continue?`)) {
              return;
            }
          } else {
            // No ownership transfer possible due to missing user ID
            if (!confirm(`Leaving "${this.editingGroup.name}". Note: Unable to transfer ownership due to missing user ID data. Continue anyway?`)) {
              return;
            }
          }
        } else {
          console.warn('⚠️ No other members found to transfer ownership to');
          
          // Regular confirmation for last member
          if (!confirm(`Are you sure you want to leave "${this.editingGroup.name}"? This action cannot be undone.`)) {
            return;
          }
        }
      } else {
        // Regular confirmation for single member (will delete group)
        if (!confirm(`Are you sure you want to leave "${this.editingGroup.name}"? This will delete the group since you're the only member.`)) {
          return;
        }
      }
        console.log('🚪 Leaving group:', this.editingGroup.name, this.editingGroup.id);
      
      try {
        console.log('🚀 Calling removeGroupMember with:', {
          groupId: this.editingGroup.id,
          newOwnerId: newOwnerId
        });
        
        const result = await removeGroupMember(this.editingGroup.id, newOwnerId);
        
        console.log('📋 removeGroupMember returned:', result);
        console.log('📋 result type:', typeof result);
        console.log('📋 result.success:', result?.success);
          if (result && result.success) {
          console.log('✅ Successfully left group - LEAVEGROUP FUNCTION');
          
          // Show success message
          let message = `You have successfully left "${this.editingGroup.name}".`;
          if (result.isLastMember) {
            message = `You have left "${this.editingGroup.name}" and were the last member. The group and its files have been deleted.`;
          } else if (newOwnerId) {
            const newOwnerEmail = this.editingGroup.members.find(m => m.userId === newOwnerId)?.email;
            message = `You have left "${this.editingGroup.name}". Ownership has been transferred to ${newOwnerEmail}.`;
          }
          
          alert(message);
          
          // Close modal and refresh groups list
          this.closeEditModal();
          await this.loadGroups();
          
        } else {
          console.error('❌ Failed to leave group:', result.error);
          alert(`Failed to leave group: ${result.error}`);
        }
        
      } catch (error) {
        console.error('❌ Error leaving group:', error);
        
        // Check if error is about missing newOwnerId
        if (error.message && error.message.includes('newOwnerId')) {
          alert('As the group owner, you must transfer ownership to another member before leaving. Please try again.');
        } else {
          alert('An error occurred while leaving the group. Please try again.');
        }
      }
    }
  },
  
  async created() {
    // Load groups when component is created
    await this.loadGroups();
  }
}
</script>

<style scoped>
.group-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>