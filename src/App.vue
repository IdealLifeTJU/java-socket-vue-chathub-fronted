//主文件，对wxChat的用法做示例

<template>
  <div class="chatHub">
   <NickNameAlert 
    :display="isDisplay" 
    v-on:listenToNickName="getNickName" 
    style='position:fixed; z-index:999; top:0;'
    class="nickName">
  </NickNameAlert>
   <wxChat 
     :data="ChatData"
     :showShade="false"
     contactNickname="Web Socket Chat Hub"
     :getUpperData="getUpperData"
     :getUnderData="getUnderData"
     :ownerAvatarUrl="ownerAvatarUrl"
     :contactAvatarUrl="contactAvatarUrl"
     :systemAvatarUrl="systemAvatarUrl"
     :width="1200">
    </wxChat>
    <div class="textareaContainer">
      <textarea class="InputArea" v-model="textMsg">
      </textarea>
      <input type="file" ref="file" multiple size="80"/>
      <input class="inputButton" type="button" @click="sendFile" value="文件上传"/>
      <button class="btn btn-default inputButton" v-on:click="send(1,textMsg)" >
        发送
      </button>
    </div>
 </div>
</template>

<script>
import wxChat from './components/wxChat.vue'
import NickNameAlert from './components/NickNameAlert.vue'
export default {
  name: 'app',
  data(){
    return {
      //websocket部分
      websocket : null,
      isDisplay : true,
      sessionId:"",
      nickName:"Test",
        //表示即将到来的文件发送者的昵称
      senderNickName:String,
        //1：即将到来图片由自己发送；-1：即将到来的图片由他人发送;
        //2：即将到来的文件由自己发送；-2：即将到来的文件由他人发送；
        //0: 没有文件将要到来。
      fileState:Number,
      files:String,
      //即将到来的文件的名称
      fileName:String,
      //信息展示部分
      textMsg:"",
      upperTimes: 0,
      underTimes: 0,
      upperId: 0,
      underId: 6,
      width: window.screen.width,
      ownerAvatarUrl: './src/assets/avatar1.png',
      contactAvatarUrl: './src/assets/avatar2.png',
      systemAvatarUrl:'./src/assets/logo.png',
      ChatData: [{
        id: 1,
        messageType: 1,
        type:3,
        nickName:"Test",
        content: '你好!![呲牙]',
        ctime: new Date().toLocaleString()
      },
      {
        id: 2,
        messageType: 1,
        type:1,
        nickName:"Test",
        content: '你也好。[害羞]',
        ctime: new Date().toLocaleString()
      },
      {
        id: 3,
        messageType: 1,
        type:3,
        nickName:"Test",
        content: '这是我的简历头像：',
        ctime: new Date().toLocaleString()
      },
      {
        id: 4,
        messageType: 2,
        type:3,
        nickName:"Test",
        content: './src/assets/wyz.jpg',
        ctime: new Date().toLocaleString()
      },
      {
        id: 5,
        messageType: 1,
        type:2,
        nickName:"Test",
        content: '你开心就好。[微笑]',
        ctime: new Date().toLocaleString()
      },
      {
        id: 6,
        messageType: 1,
        type:3,
        nickName:"Test",
        content: '你开心就好。[微笑]',
        ctime: new Date().toLocaleString()
      }]
    }
  },
  components:{wxChat,NickNameAlert},
  created(){
    this.initWidth();
  },
  methods:{
    sendFile:function(){
      var that = this;
      //使用HTML5自带的File API上传文件
      var files = this.$refs.file.files;
      var file = files[0];
      if(files.length > 1){
        alert("一次只能传输一个文件！");
        return;
      }
      if(typeof FileReader == "undefined"){
        alert("你的浏览器不支持FileReader!");
        return;
      }
      //判断文件是否是图片
      var index=file.name.lastIndexOf(".");
      var ext = file.name.substr(index+1);
      //用于判断是否为图片的函数
      var isAssetTypeAnImage = function(ext){
        return [
          'png','jpg','jpeg','bmp','webp','psd','svg','tiff'
        ].indexOf(ext.toLowerCase()) !== -1;
      };
      console.log(file.size);
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
    connectWebSocket(){
        //判断当前浏览器是否支持WebSocket
        var handleMessage = this.handleMessage;
        if ('WebSocket'in window) {
          if(this.websocket != null){
            console.log("连接已建立！");
          }else{
            this.websocket = new WebSocket("ws://localhost:8080/websocket/"+this.nickName);
            console.log("连接建立成功！");
          }
        } else {
            console.log('Not support websocket')
        }
        //连接发生错误的回调方法
        this.websocket.onerror = function() {
            //setMessageInnerHTML("error");
        };
        //连接成功建立的回调方法
        this.websocket.onopen = function(event) {
            //setMessageInnerHTML("Loc MSG: 成功建立连接");
        }
        //接收到消息的回调方法
        this.websocket.onmessage = function(event) {
          handleMessage(event.data);
        }
        //连接关闭的回调方法
        this.websocket.onclose = function() {
            //setMessageInnerHTML("Loc MSG:关闭连接");
            this.websocket = null;
        }
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function() {
          if(this.websocket != null){
            this.websocket.close();
          }
        }
    },
    //将消息显示在网页上
    handleMessage(message) {
      var that = this;
      if(typeof (message) != "string"){
        //如果客户端此前没有收到服务端发送的文件头信息，抛弃这组文件
        if(this.fileState == 0){
          return;
        }else if(this.fileState == 1){
          var fileState = 3;
          var senderNickName = this.nickName;
          var messageType = 2;
        }else if(this.fileState == -1){
          var fileState = 2;
          var senderNickName = this.senderNickName;
          var messageType = 2;
        }else if(this.fileState == 2){
          var fileState = 3;
          var senderNickName = this.nickName;
          var messageType = 3;
          var fileName = this.fileName;
        }else if(this.fileState == -2){
          var fileState = 2;
          var senderNickName = this.senderNickName;
          var messageType = 3;
          var fileName = this.fileName;
        }
        var reader = new FileReader();
        reader.onload = function(event){
          if(event.target.readyState == FileReader.DONE){
            //得到FileReader读取二进制数据所得到的URL，并用其生成图片或者文件。
            var url = event.target.result;
            if(messageType==3){
              var msg={
                id:that.ChatData.length + 1,
                type:fileState,
                messageType:messageType,
                nickName:senderNickName,
                content:fileName,
                fileHref:url,
                ctime:new Date().toLocaleString(),
              }
              that.fileName = null;
            }else{
              var msg={
                id:that.ChatData.length + 1,
                type:fileState,
                messageType:messageType,
                nickName:senderNickName,
                content:url,
                ctime:new Date().toLocaleString(),
              };
            }
            that.ChatData.splice(that.ChatData.length,0,msg);
          }
        }
        reader.readAsDataURL(message);
        this.fileState = 0;
        this.senderNickName = null;
        return;
      }
      
      message = JSON.parse(message);
      if(message.type == 3){
        this.sessionId = message.content;
        var msg = {
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          nickName:"系统提示",
          content:"您已经连接进入聊天室，当前在线人数为"+message.userNum+"人。",
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 2){
        var msg={
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          nickName:"系统提示",
          content:"新用户"+message.nickName+"已经连接进入聊天室，当前在线人数为"+message.userNum+"人。",
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 4){
        var msg={
          id:this.ChatData.length + 1,
          type:1,
          messageType:1,
          nickName:"系统提示",
          content:"用户"+message.nickName+"已经退出聊天室，当前在线人数为"+message.userNum+"人。",
          ctime: new Date().toLocaleString(),
        };
      }else if(message.type == 1){
        var msg={
          id:this.ChatData.length + 1,
          type:2,
          messageType:1,
          nickName:message.nickName,
          content:message.content,
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 5){
        var msg={
          id:this.ChatData.length + 1,
          type:3,
          messageType:1,
          nickName:this.nickName,
          content:message.content,
          ctime:new Date().toLocaleString(),
        };
      }else if(message.type == 6){
        this.senderNickName = message.nickName;
        this.fileState = -1;
      }else if(message.type == 7){
        this.fileState = 1;
      }else if(message.type == 8){
        this.senderNickName = message.nickName;
        this.fileName = message.fileName;
        this.fileState = -2;
        console.log(this.fileName);
      }else if(message.type == 9){
        this.fileName = message.fileName;
        this.fileState = 2;
      }
      if(msg){
        this.ChatData.splice(this.ChatData.length,0,msg);
      }
    },
    //关闭连接
    closeWebSocket() {
      if(this.websocket != null){
        this.websocket.close();
        this.websocket = null;
      }
    },
    //发送消息
    send(type, message) {
      var socketMsg = {type:type};
      if(type == 1){
        socketMsg.msg = message;
        this.textMsg = "";
        this.websocket.send(JSON.stringify(socketMsg));
      }else if(type == 2){
        this.websocket.send(message);
      }else if(type == 3){
        this.websocket.send(message);
      }else if(type == 4){
        socketMsg.msg = message;
        this.websocket.send(JSON.stringify(socketMsg));
      }
    },
    getNickName(data){
      this.nickName = data;
      this.isDisplay = false;
      console.log(this.nickName);
      this.connectWebSocket();
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
  mounted(){
    
  },
}
</script>

<style>
.inputButton{
  height:50px;
  width:100px;
  font-size:20px;
  position:relative;
  margin:5px auto;
  margin-right:10px;
  float:right;
  background: white;
  border:2px 2px 2px 2px;
  border-color: skyblue;
  border-style:double;
}
.textareaContainer{
  width:1200px;
  height:400px;
  /*position:fixed;
  z-index:100;
  left:1000px;
  top:600px;*/
  margin:600px auto;
  overflow: hidden;
}
.InputArea{
  background:white;
  margin: 20px auto;
  overflow:hidden;
  padding:0;
  position:relative;
  z-index:101;
  min-width:300px;
  width:100%;
  height:70%;
  font-size:30px;
}
.chatHub{
  width:100%;
  height:2000px;
  position:fixed;
  left:0;
  top:0;
  background:#efefef;
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

</style>
