import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { Amplify } from 'aws-amplify'
import awsExports from './aws-exports'

Amplify.configure(awsExports)

createApp(App).use(router).mount('#app')

