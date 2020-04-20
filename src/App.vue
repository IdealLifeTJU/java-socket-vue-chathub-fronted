<template>
<div>
  <Header></Header>
  <router-view/>
  <Footer></Footer>
</div>
</template>
<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import {setCookie, getCookie, delCookie} from './assets/js/cookie';
export default{
  components:{
    Header, Footer, 
  },
}
</script>
