<template>
  <div class="group-management">
    <!-- Create Group Folder -->
    <div class="mb-8 p-6 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Create New Group Folder</h2>
      <div class="flex gap-4">
        <input
          v-model="newGroupName"
          type="text"
          placeholder="Group folder name"
          class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        <button
          @click="createGroup"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>
    </div>

    <!-- Group List -->
    <div class="mb-8" v-if="groups.length > 0">
      <h2 class="text-xl font-semibold mb-4">Your Group Folders</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="group in groups"
          :key="group.id"
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-lg">{{ group.name }}</h3>
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
          <p class="text-sm text-gray-500 mt-1">
            {{ group.members.length }} member(s)
          </p>
        </div>
      </div>
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
              >
              <button
                @click="addMember"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>

          <!-- Members List -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Current Members</h3>
            <div v-if="editingGroup.members.length === 0" class="text-gray-500 text-sm">
              No members added yet
            </div>
            <ul v-else class="divide-y">
              <li v-for="member in editingGroup.members" :key="member.email" class="py-3 flex justify-between items-center">
                <div>
                  <p class="font-medium">{{ member.email }}</p>
                  <p class="text-xs text-gray-500">Joined {{ formatDate(member.joinedAt) }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <!-- Permissions Dropdown -->
                  <select
                    v-model="member.permissions"
                    @change="updateMemberPermissions(member)"
                    class="px-2 py-1 border rounded text-sm"
                  >
                    <option value="view">Can View</option>
                    <option value="edit">Can Edit</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    @click="removeMember(member.email)"
                    class="text-red-500 hover:text-red-700"
                    title="Remove member"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          
          <div class="flex justify-end gap-2 pt-4 border-t">
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
</template>

<script>
export default {
  name: 'GroupManagement',
  data() {
    return {
      newGroupName: '',
      newMemberEmail: '',
      groups: [
        {
          id: '1',
          name: 'Marketing Team',
          members: [
            { email: 'john@example.com', permissions: 'admin', joinedAt: new Date() },
            { email: 'jane@example.com', permissions: 'edit', joinedAt: new Date(Date.now() - 86400000) }
          ],
          permissions: {
            upload: true,
            delete: false,
            share: true
          }
        },
        {
          id: '2',
          name: 'Development Team',
          members: [
            { email: 'dev1@example.com', permissions: 'admin', joinedAt: new Date() }
          ],
          permissions: {
            upload: true,
            delete: true,
            share: false
          }
        }
      ],
      editingGroup: null
    }
  },
  methods: {
    createGroup() {
      if (!this.newGroupName.trim()) return
      
      const newGroup = {
        id: Date.now().toString(),
        name: this.newGroupName.trim(),
        members: [],
        permissions: {
          upload: false,
          delete: false,
          share: false
        }
      }
      
      this.groups.push(newGroup)
      this.newGroupName = ''
    },
    
    openEditGroup(group) {
      this.editingGroup = JSON.parse(JSON.stringify(group))
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
    
    addMember() {
      if (!this.newMemberEmail.trim() || !this.validateEmail(this.newMemberEmail)) return
      
      const email = this.newMemberEmail.trim().toLowerCase()
      const exists = this.editingGroup.members.some(m => m.email === email)
      
      if (!exists) {
        this.editingGroup.members.push({
          email,
          permissions: 'view',
          joinedAt: new Date()
        })
        this.newMemberEmail = ''
      }
    },
    
    removeMember(email) {
      this.editingGroup.members = this.editingGroup.members.filter(m => m.email !== email)
    },
    
    updateMemberPermissions(member) {
      // Changes are automatically reflected in the editingGroup object
    },
    
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
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