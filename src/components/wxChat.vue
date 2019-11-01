//微信聊天可视化组件
//依赖scrollLoader组件, 依赖指令v-emotion（实现请查看main.js）

//参数：
// width               组件宽度，默认450
// wrapBg              外层父元素背景颜色，默认#efefef
// maxHeight           展示窗口最高高度, 默认900
// contactAvatarUrl    好友头像url
// ownerAvatarUrl      微信主人头像url
// ownerNickname       微信主人昵称
// systemAvatarUrl     系统消息头像
// getUpperData        （必需）当滚动到上方时加载数据的方法，返回值要为Promise对象，resolve的结构同data
// getUnderData        （必需）当滚动到下方时加载数据的方法，返回值同上
// data                （必需）传入初始化数据， 结构如下：
[{
    //根据这个来排序消息
    id: 1, 
    //1为文本，2为图片
    messageType: 1, 
    //1：系统信息，2：来自于其他人消息，3：自己的消息
    type: 1,
    //显示消息发送者的称呼
    nickName:String 
    //当messageType为1时这里是文本消息，当messageType为2时这里要存放图片地址；当messageType为3时这里存放文件名
    content: '你好!![呲牙]', 
    //显示当前消息的发送时间
    ctime: new Date().toLocaleString() ,
    //倘若信息类型是文件，此值存放文件链接
    fileHref:hull
},
{
    id: 2,
    messageType: 1,
    nickName:Test,
    type = 1；
    content: '你也好。[害羞]',
    ctime: new Date().toLocaleString()
}]


<style scoped>
    .wxchat-container{ width:100%; height:600px; z-index: 100; position: fixed; left:0; top: 0; overflow: hidden;}
    .shadow{ position: absolute; top:0; left: 0; z-index: 100; width: 100%; height: 100%; background: #000; opacity: .2; }
    .window {box-shadow: 1px 1px 20px -5px #000; /*max-width: 450px;*/ min-width: 300px; background: #F5F5F5; margin: 0 auto; overflow: hidden; padding: 0; height: 100%;position: relative;z-index: 101;}
    button{border:0; background:none; border-radius: 0;text-align: center;}
    button{outline:none;}
    .w100{width: 100%;}
    .mt5{margin-top: 5px;}
    .mt10{margin-top: 10px;}
    .mt20{margin-top: 20px;}
    .mb10{margin-bottom: 10px;}
    .mb20{margin-bottom: 20px;}
    .fs0{font-size: 0}
    .title{background: #000; text-align: center; color:#fff; width: 100%; height: 50px; line-height: 50px; font-size: 14px;}
    .loading,.no-more{text-align: center; color: #b0b0b0; line-height: 100px;}
    .no-more{line-height: 60px;}
    .pull-right{float: right;}
    .link-line{text-decoration: underline;}
    .message{
        /*height: 100%;*/
        padding: 10px 15px;
        /*overflow-y: scroll;*/
        background-color: #F5F5F5;
    }
    .message li {
        margin-bottom: 15px;
        left:0;
        position: relative;
        display: block;
    }
    .message .time {
        margin: 10px 0;
        text-align: right;
    }
    .message .text {
        display: inline-block;
        position: relative;
        padding: 0 10px;
        max-width: calc(100% - 75px);
        min-height: 35px;
        line-height: 2.1;
        font-size: 15px;
        padding: 6px 10px;
        text-align: left;
        word-break: break-all;
        background-color: #fff;
        color: #000;
        border-radius: 4px;
        box-shadow: 0px 1px 7px -5px #000;
    }
    .message .avatar {
        float: left;
        margin: 0 10px 0 0;
        border-radius: 3px;
        background: #fff;
    }
    .message .time>span {
        display: inline-block;
        padding: 0 5px;
        font-size: 12px;
        color: #fff;
        border-radius: 2px;
        background-color: #DADADA;
    }
    .message .system>span{
        padding: 4px 9px;
        text-align: left;
    }
    .message .text:before {
        content: " ";
        position: absolute;
        top: 9px;
        right: 100%;
        border: 6px solid transparent;
        border-right-color: #fff;
    }
    .message .self {
        text-align: right;
    }
    .message .self .avatar {
        float: right;
        margin: 0 0 0 10px;
    }
    .message .self .text {
        background-color: #FFFFFF;
    }

    .message .self .text:before {
        right: inherit;
        left: 100%;
        border-right-color: transparent;
        border-left-color: #FFFFFF;
    }
    .message .image{
        max-width: 200px;
    }
    img.static-emotion-gif, img.static-emotion {
        vertical-align: middle !important;
    }

    .an-move-left{
        left: 0;
        animation: moveLeft .7s ease;
        -webkit-animation:moveLeft .7s ease; 
    }
    .an-move-right{
        left: 0;
        animation: moveRight .7s ease;
        -webkit-animation:moveRight .7s ease; 
    }
    .bgnone{
        background: none;
    }
    @keyframes moveRight{
        0%{left:-20px; opacity: 0};
        100%{left:0; opacity: 1}
    }

    @-webkit-keyframes moveRight
    {
        0%{left:-20px; opacity: 0};
        100%{left:0px; opacity: 1}
    }
    @keyframes moveLeft{
        0%{left:20px; opacity: 0};
        100%{left:0px; opacity: 1}
    }

    @-webkit-keyframes moveLeft
    {
        0%{left:20px; opacity: 0};
        100%{left:0px; opacity: 1}
    }

    @media (max-width: 367px){
        .fzDInfo{width:82%;}
    }

</style>

<template>
    <div class="wxchat-container" style="backgroundColor:#efefef; font-family:'Perpetua Titling MT','Microsoft Yahei';">
        <div class="window" id="window-view-container" :style="{maxHeight: maxHeight + 'px', width: width +'px'}">
            <!-- data is empty -->
            <div class="loading" v-if="data && data.length==0">
                <div style="margin-top: 300px;text-align:center; font-size: 16px;">
                    <span>未查找到聊天记录</span>
                </div>
            </div>

            <!-- loading -->
            <div class="loading" v-if="data.length==0">
                <div style="margin-top: 300px;">
                        <div>加载中...</div>
                </div>
            </div>

            <div class="title" v-if="data && data.length>0">
                <p v-text="contactNickname"></p>
            </div>
            <!-- main -->
            <ScrollLoader :minHeight="minHeight" @scroll-to-top="refresh" @scroll-to-botton="infinite" class="container-main" v-if="data && data.length>0" :style="{maxHeight: maxHeight-50 + 'px'}">
                <div class="message">
                    <ul>
                        <li v-for="(message, index) in data" :key="message.id" :class="message.type==3?'an-move-right':'an-move-left'">
                            <p class="time"> <span v-text="message.ctime"></span> </p>
                            <p class="time system" v-if="message.messagetype==3"> <span v-html="message.content"></span> </p>
                            <div :class="'main' + (message.type==3?' self':'')" v-else>
                                <p class="nickName">{{message.nickName}}</p>
                                <img class="avatar" width="45" height="45" :src="getAvatarUrl(message.type)">
                                <!-- 文本 -->
                                <div class="text" v-emotion="message.content" v-if="message.messageType==1"></div>
                                <!-- 图片 -->
                                <div class="text" v-else-if="message.messageType==2">
                                    <img :src="message.content" class="image" alt="聊天图片">
                                </div>
                                <!-- 文件 -->
                                <a class="text" v-else-if="message.messageType==3" :download="message.content" :href="message.fileHref">{{message.content}}</a>
                                <!-- 其他 -->
                                <div class="text" v-else-if="message.messagetype!=10000" v-text="'[暂未支持的消息类型:'+ message.messagetype +']\n\r' + message.content">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </ScrollLoader>
        </div>
    </div>
</template>

<script>
import ScrollLoader from './scrollLoader.vue';
export default {
  name: "wxChat",
  components: {
    ScrollLoader
  },
  props: {
    contactNickname: {
      type: String,
      default: 'Mystic Faces'
    }, 
    data: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 450,
    },
    maxHeight: {
      type: Number,
      default: 600
    },
    contactAvatarUrl: {
      type: String,
    },
    ownerAvatarUrl: {
      type: String,
    },
    systemAvatarUrl:{
      type: String,
    },
    getUpperData: {
      type: Function,
      required: true
    },
    getUnderData: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      isUpperLaoding: false,
      isUnderLaoding: false,
      isRefreshedAll: false,
      isLoadedAll: false,
      minHeight: 700,
      dataArray:this.data,
    }
  },
  created() {  
    //this.initData();
  },
  mounted(){
    //document.getElementsByTagName('body')[0].scrollTop=0;
    this.minHeight = document.getElementById('window-view-container').offsetHeight;
    this.maxHeight = document.getElementById('window-view-container').offsetHeight;
  },
  methods: {
    /*initData(){
      this.dataArray = this.dataArray.concat(this.data);
    },*/
      //向上拉刷新
    refresh(done) {
      var me = this;
      if(me.isUpperLaoding){
        return;
      }
      if(me.isRefreshedAll){
        done(true);
        me.isUpperLaoding = false;
        return;
      }
      try{
        this.getUpperData().then(function(data){
          if(data.length==0){
          me.isRefreshedAll = true;
            done(true);
          }else{
            me.dataArray = data.reverse().concat(me.dataArray); //倒序合并
            done();
          }
        })
      }catch (error) {
         console.error('wxChat: props "getUpperData" must return a promise object!')
      }
      me.isUpperLaoding = false;
    },
      //向下拉加载
    infinite(done) {
      var me = this;
      if(me.isUnderLaoding){
         return;
      }
      if(me.isLoadedAll){
        done(true);
        me.isUnderLaoding = false;
        return;
      }
      try {
        this.getUnderData().then(function(data){
          if(data == 0){
            me.isLoadedAll = true;
            done(true);
          }else{
            done();
            me.dataArray = me.dataArray.concat(data); //直接合并
          }
        })
      } catch (error) {
        console.error('wxChat: props "getUnderData" must return a promise object!')
      }
      me.isUnderLaoding = false;
    },
    getAvatarUrl:function(type){
      if(type == 1){
        return this.systemAvatarUrl;
      }
      else if(type == 2){
        return this.contactAvatarUrl;
      }else if(type == 3){
        return this.ownerAvatarUrl;
      }
    }
  },
  computed:{
    
  }
}
</script>