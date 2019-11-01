import Vue from 'vue'
import Router from 'vue-router'

import EntrancePage from './pages/EntrancePage/EntrancePage.vue'
import ChatHubPage from './pages/ChatHubPage/ChatHubPage.vue'

Vue.use(Router)

export default new Router({
    routes:[
        {path:'/', 
        name: 'Entrance', 
        component: EntrancePage},
        {path:'/chatHubPage',
        name: 'chatHubPage',
        component: ChatHubPage},
    ]
})