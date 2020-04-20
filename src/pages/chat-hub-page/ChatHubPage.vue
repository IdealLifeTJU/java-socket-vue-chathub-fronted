<template>
  <div class="chatHub">
    <div class="container">
      <wxChat 
       :data="ChatData"
       :showShade="false"
       contactNickname="HOLLOW"
       :getUpperData="getUpperData"
       :getUnderData="getUnderData"
       :systemAvatarUrl="systemAvatarUrl"
       :baseAvatarUrl="baseAvatarUrl"
       :width="1200" class="wxChat"
       id="wxChat">
      </wxChat>
      <div class="textareaContainer">
        <div style="width:100%; height: 1rem; background-color:black;"></div>
        <textarea class="InputArea" v-model="textMsg" @keyup.enter="onSend()">
        </textarea>
        <div>
          <input class="rButton" type="file" ref="file" multiple size="80" value="File"/>
          <button class="btn btn-default inputButton" @click="homePage()" >
            返回
          </button>
          <button class="btn btn-default inputButton" @click="onSend()" >
            发送
          </button>
          <microPhone class="aButton" @record="recordAudio"></microPhone>
          <!--<div class="inputButton">
            <Dropdown>
              <a>用户列表</a>
              <Icon type="ios-arrow-down"></Icon>
              <dropdown-menu slot="list">
                <dropdown-item 
                ></dropdown-item>
              </dropdown-menu>
            </Dropdown>
          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import wxChat from '../../components/wxChat.vue'
import bus from '../../assets/js/bus.js'
import {setCookie, delCookie, getCookie} from '../../assets/js/cookie.js' 
import recording from '../../assets/js/recorder'
import microPhone from '../../components/microPhone.vue'
import {Dropdown, DropdownMenu, DropdownItem, Icon} from 'view-design'

export default {
  name: 'app',
  components:{
    microPhone: microPhone, wxChat, Dropdown,DropdownMenu, DropdownItem, Icon
  },
  data(){
    return {
      //websocket部分
      websocket : null,
      isDisplay : true,
      sessionId:"",
      //表示即将到来的文件发送者的昵称
      senderNickName: String,
      //表示即将到来的发送者的头像数据
      senderAvatarNum: String,
      //1：即将到来图片由自己发送；-1：即将到来的图片由他人发送;
      //2：即将到来的文件由自己发送；-2：即将到来的文件由他人发送；
      //0: 没有文件将要到来。
      fileState:Number,
      //即将到来的文件的名称
      fileName:String,
      //信息展示部分
      textMsg:"",
      upperTimes: 0,
      underTimes: 0,
      upperId: 0,
      underId: 6,
      width: window.screen.width,
      baseAvatarUrl: './src/assets/imgs/images/8_0',
      systemAvatarUrl:'./src/assets/logo.png',
      user:{},
      ChatData: [],

      //心跳检测
      heartCheck:{
        timeout: 3000,
        serverTimeout: 10000,
        timeoutObj: null,
        serverTimeoutObj: null,
        start: function(ws){
          var _this = this;
          this.timeoutObj && clearTimeout(this.timeoutObj);
          this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
          this.timeoutObj = setTimeout(function(){
            //发送一个心跳，后端返回一个心跳信息
            //onmessage拿到收回的心跳表示正常
            ws.send("123456789");
            console.log("PING");
            //计算答复的超时时间
            _this.serverTimeoutObj = setTimeout(function(){
              ws.close();
              console.log("关闭WS……");
            }, _this.serverTimeout);
          },this.timeout);
        }
      }
    }
  },
  watch:{
    ChatData(){
      this.$nextTick(()=>{
        var container = document.getElementById('scrollLoader-container');
        container.scrollTop = container.scrollHeight;
      })
    }
  },
  methods:{
    recordAudio(files){
      this.sendFile(files);
    },
    homePage(){
      //删除Cookie
      delCookie("avatarNum");
      delCookie("nickName");
      delCookie("roomNum");
      delCookie("chosenHub");
      if(this.websocket != null)
        this.websocket.close();
      this.$router.push({
        name: 'EntrancePage',
      });
    },
    onSend(){
      if(this.textMsg===""){
        this.sendFile();
      }else{
        this.send(1, this.textMsg);
      }
    },
    sendFile:function(audioFile){
      var that = this;
      var file;
      if(audioFile == null || audioFile == undefined){
        var files = this.$refs.file.files;
        file = files[0];
        if(files.length > 1){
          alert("一次只能传输一个文件！");
          return;
        }
        if(files.length == 0){
          alert("请选择一个文件！");
        }
        if(typeof FileReader == "undefined"){
          alert("你的浏览器不支持FileReader!");
          return;
        }
      }else{
        file = audioFile;
      }
      //使用HTML5自带的File API上传文件
      
      //判断文件是否是图片
      var index=file.name.lastIndexOf(".");
      var ext = file.name.substr(index+1);
      //用于判断是否为图片的函数
      var isAssetTypeAnImage = function(ext){
        return [
          'png','jpg','jpeg','bmp','webp','psd','svg','tiff'
        ].indexOf(ext.toLowerCase()) !== -1;
      };
      //是图片，缩放并上传
      if(isAssetTypeAnImage(ext)){
        var reader = new FileReader();
        var img = new Image();
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        img.onload = function(){
          var originWidth = this.width;
          var originHeight = this.height;
          //最大图片尺寸限制：400x400
          var maxWidth = 400, maxHeight = 400;
          var targetWidth = originWidth,targetHeight = originHeight;
          //图片尺寸超过400x400的限制
          if(originWidth>maxWidth || originHeight>maxHeight){
            //更宽：按照宽度限定尺寸
            if(originWidth/originHeight>1){
              targetWidth = maxWidth;
              targetHeight = Math.round(maxWidth*(originHeight/originWidth));
            }else{
              //更高：按照高度限定尺寸
              targetHeight = maxHeight;
              targetWidth = Math.round(maxHeight*(originWidth/originHeight));
            }
          }
          //Canvas对图片进行缩放
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          //清除画布
          context.clearRect(0,0,targetWidth,targetHeight);
          context.drawImage(img,0,0,targetWidth,targetHeight);
          //Canvas转为blob并上传
          canvas.toBlob(function(blob){
            var reader1 = new FileReader();
            reader1.onload = function(e1){
              var uArray = new Uint8Array(e1.target.result);
              var uArray1 = new Uint8Array(uArray.length+1);
              uArray1[0] = 2;
              for(var i=0; i<uArray.length; i++){
                uArray1[i+1] = uArray[i];
              }
              var blob1 = new Blob([uArray1]);
              that.send(2,blob1);
            }
            reader1.readAsArrayBuffer(blob);
          })         
        }
        reader.onload = function(e){
          img.src = e.target.result;
        }
        reader.readAsDataURL(file);
      //不是图片，为其他文件类型，查看大小，小的上传。
      }else{
        if(file.size>102400){
          alert("上传文件过大！");
          return;
        }
        //先发送一条信息告诉客户端有文件要来了
        that.send(4,file.name);
        var reader = new FileReader();
        reader.onload = function(e){
          var uArray = new Uint8Array(e.target.result);
          var uArray1 = new Uint8Array(uArray.length+1);
          uArray1[0] = 1;
          for(let i=0; i<uArray.length; i++){
            uArray1[i+1] = uArray[i];
          };
          var blob = new Blob([uArray1]);
          that.send(3,blob);
        }
        reader.readAsArrayBuffer(file);
      }
    },
    //重连
    reconnect(){
      var lockReconnect = false;
      var _this = this;
      if(lockReconnect){
        return;
      }
      lockReconnect = true;
      var tt; 
      tt && clearTimeout(tt);
      tt = setTimeout(function(){
        _this.connectWebSocket();
        lockReconnect = false;
        console.log("重连中");
      }, 4000);
    },
    connectWebSocket(){
        //判断当前浏览器是否支持WebSocket
        var handleMessage = this.handleMessage;
        var roomNum = this.user.roomNum-1;
        let connectString = "ws://localhost:8080/websocket/"+this.user.roomNum+"/"
        +this.user.nickName+"/"+this.user.avatarNum + "/" + this.user.chosenHub;
        console.log(connectString);
        if ('WebSocket'in window) {
          if(this.websocket != null){
            console.log("连接已建立！");
          }else{
            try{
              this.websocket = new WebSocket(connectString);  
            }catch(e){
              this.reconnect();
            }
            console.log("连接建立成功！");
          }
        } else {
            console.log('Not support websocket')
        }
        var _this = this;
        //连接发生错误的回调方法
        this.websocket.onerror = function() {
            //setMessageInnerHTML("error");
            _this.reconnect();
        };
        //连接成功建立的回调方法
        this.websocket.onopen = function(event) {
          _this.heartCheck.start(_this.websocket);
            //setMessageInnerHTML("Loc MSG: 成功建立连接");
        }
        //接收到消息的回调方法
        this.websocket.onmessage = function(event) {
          handleMessage(event.data);
          _this.heartCheck.start(_this.websocket);
        }
        //连接关闭的回调方法
        this.websocket.onclose = function() {
            //setMessageInnerHTML("Loc MSG:关闭连接");
            this.websocket = null;
            _this.reconnect();
        }
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function() {
          if(this.websocket != null){
            this.websocket.close();
          }
        }
    },
    //初始化监听事件

    //将消息显示在网页上
    handleMessage(message){
      var that = this;
      if(typeof (message) != "string"){
        //如果客户端此前没有收到服务端发送的文件头信息，抛弃这组文件
        if(this.fileState == 0){
          return;
        }else if(this.fileState == 1){
          var fileState = 3;
          var senderNickName = this.user.nickName;
          var senderAvatarNum = this.user.avatarNum;
          var messageType = 2;
        }else if(this.fileState == -1){
          var fileState = 2;
          var senderNickName = this.senderNickName;
          var senderAvatarNum = this.senderAvatarNum;
          var messageType = 2;
        }else if(this.fileState == 2){
          var fileState = 3;
          var senderNickName = this.user.nickName;
          var senderAvatarNum = this.user.avatarNum;
          var messageType;
          var fileName = this.fileName;
          var index= fileName.lastIndexOf(".");
          var ext = fileName.substr(index+1);
          //用于判断是否为图片的函数
          var isAssetTypeAnAudio = function(ext){
            return [
              'mp3','wav','au','aif','ram','mid',
            ].indexOf(ext.toLowerCase()) !== -1;
          };
          if(isAssetTypeAnAudio(ext)){
            messageType = 4;
          }else{
            messageType = 3;
          }
        }else if(this.fileState == -2){
          var fileState = 2;
          var senderNickName = this.senderNickName;
          var senderAvatarNum = this.senderAvatarNum;
          var messageType;
          var fileName = this.fileName;
          var index= fileName.lastIndexOf(".");
          var ext = fileName.substr(index+1);
          //用于判断是否为图片的函数
          var isAssetTypeAnAudio = function(ext){
           return [
             'mp3','wav','au','aif','ram','mid',
           ].indexOf(ext.toLowerCase()) !== -1;
          };
          if(isAssetTypeAnAudio(ext)){
            messageType = 4;
          }else{
            messageType = 3;
          }
        }
        var reader = new FileReader();
        reader.onload = function(event){
          if(event.target.readyState == FileReader.DONE){
            //得到FileReader读取二进制数据所得到的URL，并用其生成图片或者文件。
            var url = event.target.result;
            if(messageType==3){
              //文件
              var msg={
                id: that.ChatData.length + 1,
                type: fileState,
                messageType: messageType,
                nickName: senderNickName,
                avatarNum: senderAvatarNum,
                content: fileName,
                fileHref: url,
                ctime:new Date().toLocaleString(),
              }
              that.fileName = null;
            }else if(messageType == 4){
              let blob = new Blob([new Int8Array(this.result)]);
              // 生成一个本地的blob url
              let blobUrl = URL.createObjectURL(blob);
              var msg={
                id: that.ChatData.length + 1,
                type: fileState,
                messageType: 4,
                nickName: senderNickName,
                avatarNum: senderAvatarNum,
                content: fileName,
                fileHref: blobUrl,
                ctime:new Date().toLocaleString(),
              }
              that.fileName = null;
            }else{
              //图片
              var msg={
                id:that.ChatData.length + 1,
                type:fileState,
                messageType:messageType,
                nickName:senderNickName,
                avatarNum: senderAvatarNum,
                content:url,
                ctime:new Date().toLocaleString(),
              };
            }
            that.ChatData.splice(that.ChatData.length,0,msg);
          }
        }
        if(messageType == 4){
          reader.readAsArrayBuffer(message);
        }else{
          reader.readAsDataURL(message);
        }
        
        this.fileState = 0;
        this.senderNickName = null;
        this.senderAvatarNum = null;
        return;
      }
      //查看是否心跳检测数据
      if(message === "123456789"){
        return;
      }
      message = JSON.parse(message);
      if(message.type == 3){
        this.sessionId = message.content;
        var msg = {
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          avatarNum: -1,
          nickName:"系统提示",
          content:"您已经连接进入聊天室，当前在线人数为"+message.userNum+"人。",
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 2){
        var msg={
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          avatarNum: -1,
          nickName:"系统提示",
          content:"新用户"+message.nickName+"已经连接进入聊天室，当前在线人数为"+message.userNum+"人。",
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 4){
        var msg={
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          avatarNum: -1,
          nickName:"系统提示",
          content:"用户"+message.nickName+"已经退出聊天室，当前在线人数为"+message.userNum+"人。",
          ctime: new Date().toLocaleString(),
        };
      }else if(message.type == 1){
        var msg={
          id:this.ChatData.length + 1,
          type:2,
          messageType:1,
          avatarNum: message.avatarNum,
          nickName:message.nickName,
          content:message.content,
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 5){
        var msg={
          id: this.ChatData.length + 1,
          type: 3,
          messageType: 1,
          nickName: this.user.nickName,
          avatarNum: this.user.avatarNum,
          content: message.content,
          ctime: new Date().toLocaleString(),
        };
      }else if(message.type == 6){
        this.senderNickName = message.nickName;
        this.senderAvatarNum = message.avatarNum;
        this.fileState = -1;
      }else if(message.type == 7){
        this.fileState = 1;
      }else if(message.type == 8){
        this.senderNickName = message.nickName;
        this.senderAvatarNum = message.avatarNum
        this.fileName = message.fileName;
        this.fileState = -2;
      }else if(message.type == 9){
        this.fileName = message.fileName;
        this.fileState = 2;
      }else if(message.type == 10){
        var msg={
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          avatarNum: -1,
          nickName:"系统提示",
          content:"进入房间"+this.user.roomNum+"失败！房间人数已满。",
          ctime: new Date().toLocaleString(),
        };

        alert("进入房间"+this.user.roomNum+"失败！房间人数已满。");
        this.$router.push({
        name: 'EntrancePage',
        });
      }
      if(msg){
        this.ChatData.splice(this.ChatData.length,0,msg);
      }
    },
    //关闭连接
    closeWebSocket(){
      if(this.websocket != null){
        this.websocket.close();
        this.websocket = null;
      }
    },
    //发送消息
    send(type, message){
      var socketMsg = {type:type};
      if(type == 1){
        //文字信息
        socketMsg.msg = message;
        this.textMsg = "";
        this.websocket.send(JSON.stringify(socketMsg));
      }else if(type == 2){
        //图片数据
        this.websocket.send(message);
      }else if(type == 3){
        //文件数据
        this.websocket.send(message);
      }else if(type == 4){
        //给客户端发送的文件头信息
        socketMsg.msg = message;
        this.websocket.send(JSON.stringify(socketMsg));
      }
    },
    initWidth(){
      var ua = navigator.userAgent;
      var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      isIphone =!ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      isAndroid = ua.match(/(Android)\s+([\d.]+)/),
      isMobile = isIphone || isAndroid;
      //非移动端设置400px宽度，移动端是100%
      if(!isMobile){
        this.width = 400
      }
    },
    //向上滚动加载数据
    getUpperData(){
      var me = this;
      // 这里为模拟异步加载数据
      // 实际上你可能要这么写:
      // return axios.get('xxx').then(function(result){
      //     return result;  //result的格式需要类似下面resolve里面的数组
      // })
      return new Promise(function(resolve){
        setTimeout(function(){
           //模拟加载完毕
          if(me.upperTimes>3){
            return resolve([]);
          }
          //加载数据
          resolve([{
              id: me.upperId-1,
              messageType: 1,
              type:3,
              nickName:"Test",
              content: '向上滚动加载第 ' + me.upperTimes +' 条！',
              ctime: new Date().toLocaleString()
            },
            {
              id: me.upperId-2,
              messageType: 1,
              type:2,
              nickName:"Test",
              content: '向上滚动加载第 ' + me.upperTimes +' 条！',
              ctime: new Date().toLocaleString()
            },]
          )
        }, 1000);
        me.upperId= me.upperId+2;
        me.upperTimes++;
      })
    },
    getUnderData(){
      var me = this;

      //意义同getUpperData()
      return new Promise(function(resolve){
        setTimeout(function(){
          //模拟加载完毕
          if(me.underTimes>3){
            return resolve([]);
          }
          
          //加载数据
          resolve(
            [/*{
              direction: 1,
              id: me.underId+1,
              type: 1,
              content: '向下滚动加载第 ' + me.underTimes +' 条！',
              ctime: new Date().toLocaleString()
            },
            {
              direction: 2,
              id: me.underId+2,
              type: 1,
              content: '向下滚动加载第 ' + me.underTimes +' 条！',
              ctime: new Date().toLocaleString()
            }*/]
          )
        }, 1000);

        me.underId = me.underId+2;
        me.underTimes++;
      })
    },
  },
  //在此更新数据
  mounted(){
    let user = bus.user;
    if(user == undefined){
      this.user.nickName = getCookie("nickName");
      this.user.avatarNum = getCookie("avatarNum");
      this.user.roomNum = getCookie("roomNum");
      this.user.chosenHub = getCookie("chosenHub");
    }else{
      this.user = user;
    }
    this.connectWebSocket();
  },
  created(){
    this.initWidth();
    bus.$on('send', function(user){
      bus.user = user;
    });
        
  },
}
</script>

<style>
.wxChat{
  background-image:url('../../assets/imgs/timg.jpg')
}
.aButton{
  position:relative;
  margin:5px auto;
  margin-right: 10rem;
  float:right;
}
.inputButton{
  height:2.5rem;
  width:8rem;
  font-size:1.6rem;
  position:relative;
  margin:5px auto;
  margin-right:10px;
  float:right;
  background: white;
  border: solid black 0.05rem;
  text-align:center;
  font-size: 1.6rem;
  font-family: "STSong";
  font-weight: bold;
  border-radius: 2.1rem;
}
.textareaContainer{
  width:1200px;
  height:400px;
  margin:600px auto;
  overflow: hidden;
}
.InputArea{
  background:white;
  margin: 0 auto;
  overflow:hidden;
  padding:0;
  position:relative;
  z-index:101;
  min-width:300px;
  width:100%;
  height:30%;
  font-size:30px;
  padding: 0.3rem 1rem;
}
.chatHub{
  width:100%;
  height:100%;
  position:fixed;
  left:0;
  top:0;
  background:#efefef;
  background-image:url('../../assets/imgs/timg.jpg')
}
*{
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
}

.rButton{
  background: white;
  height: 2.5rem;
  border: solid black 0.05rem;
  width: 20rem;
  text-align:center;
  font-size: 1.6rem;
  margin-top: 0.5rem;
  font-family: "STSong";
  font-weight: bold;
  border-radius: 2.1rem;
}
.InputArea:focus{
  background-color:#fffbf0;
  border: 0.1rem solid skyblue !important;
}
</style>
