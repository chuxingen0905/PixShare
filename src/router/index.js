import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Editor from '../views/PhotoEditor.vue'
import GroupManagementPage from '../views/GroupManagementPage.vue'
import SharedPhoto from '../views/SharedPhoto.vue'
import PresignedViewer from '../views/PresignedViewer.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/forgot', name: 'ForgotPassword', component: ForgotPassword },
    { path: '/editor', name: 'Editor', component: Editor },
    { 
        path: '/groups', 
        name: 'GroupManagement', 
        component: GroupManagementPage 
    },    {
        path: '/share/:id',
        name: 'SharedPhoto',
        component: SharedPhoto
    },
    {
        path: '/view',
        name: 'PresignedViewer',
        component: PresignedViewer
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router