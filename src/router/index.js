import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Editor from '../views/PhotoEditor.vue'
import GroupManagementPage from '../views/GroupManagementPage.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router