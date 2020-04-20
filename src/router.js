import Vue from 'vue'
import Router from 'vue-router'

import EntrancePage from './pages/entrance-page/EntrancePage.vue'
import ChatHubPage from './pages/chat-hub-page/ChatHubPage.vue'

import {getCookie, delCookie} from './assets/js/cookie'

Vue.use(Router);

const routes = [
    {path:'/', 
    name: 'EntrancePage', 
    component: EntrancePage,
    meta:{requiredAuth: true}},

    {path:'/chatHubPage',
    name: 'chatHubPage',
    component: ChatHubPage,
    meta:{requiredAuth: false}},
];

const router = new Router({
    routes
});

//检验Cookie存不存在，如存在，直接跳转至聊天室
//如果不存在，删除客户端Cookie并保持不动
router.beforeEach((to, from, next) =>{
    if(to.meta.requiredAuth){
        if(getCookie("nickName") != null){
            next({path: '/chatHubPage'});
        }else{
            next();
        }
    }else{
        next();
    }
});

export default router;