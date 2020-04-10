<template>
  <div style="width:100%; height:50rem;">
    <div 
      style="width:100%; margin-top:5rem;
      margin-left:auto; margin-right:auto;
      text-align:center">
      <img 
        style="width:50rem; margin:0 auto;" 
        src="../../assets/imgs/Hollow.png">
      </img>
    </div>
    <div style="width:100%; text-align:center; margin-top: -5rem">
      <input
        style="width:40rem; height:3rem;
        margin:0 auto; border-radius:5rem 5rem 5rem 5rem;
        border:solid 0.05rem black; color:black;
        text-indent:2rem; font-size:1.2rem;
        font-family: 'Perpetua Titling MT','Microsoft YaHei'; outline:none;
        text-align:center;" autofocus
        placeholder="INPUT YOUR USERNAME HERE" v-model="user.nickName"
        ></input>
    </div>
    <div 
      style="width:100%; margin-top:3rem; 
      height:10rem; text-align:center;">
      <RadioGroup size="large" type="button" 
        style="height:100%; width:50%; border: 0;
        margin: 0 auto;"> 
        <Radio :class="{chosenButton: isChosenButton(0)}" 
          style="border:0; height:5rem; width:5rem; 
          padding: 0 0;">
          <Button shape="circle"
            style="width:4rem; height:4rem;
            padding: 0 0; margin-top:0.5rem" @click="chosenHub = 0; confirmModal= true;">
            <img 
              style="width:90%;height:90%; margin-left:0.2rem;
              margin-top:0.2rem;" 
              src="../../assets/imgs/AnonymousMulti.png"/>
          </Button>
          <div></div>
        </Radio>

        <Radio :class="{chosenButton: isChosenButton(1)}" 
        style="margin-left:5rem; border:0; height:5rem; 
        width:5rem; padding:0 0;">
          <Button shape="circle"
            style="width:4rem; height:4rem;
            padding: 0 0; margin-top:0.5rem;" @click="chosenHub = 1; confirmModal = true;">
            <img 
              style="width:90%;height:90%; margin-left:-0.05rem;
              margin-top:0.1rem;" 
              src="../../assets/imgs/AnonymousSingle.png"/>
          </Button>
        </Radio>

        <Radio :class="{chosenButton: isChosenButton(2)}" 
        style="margin-left:5rem; border:0; height:5rem; 
        width:5rem; padding:0 0 ;">
          <Button shape="circle"
            style="width:4rem; height:4rem; background-color:black;
            padding: 0 0; margin-top:0.5rem;" @click="chosenHub = 2; confirmModal = true;">
            <img 
              style="width:90%;height:90%; margin-left:0rem;
              margin-top:0.1rem; background-color:" 
              src="../../assets/imgs/SignaturedSingle.png"/>
          </Button>
        </Radio>
      </RadioGroup>
    </div>

    <div class="roomButtonContainer">
      <div style="width:40%; height:90%; margin: auto auto;">
        <div v-for="i in roomNum"class="roomButton" :class="{chosenRoom: isChosenRoom(i)}"
        @click = "chooseRoom(i)">
          {{word[i-1]}}
        </div>
      </div>
    </div>

    <div style="width:100%; margin-top:1rem; 
      height:10rem; text-align:center;">
      <Button 
        style="width:7rem; height:4rem; border:0.09rem solid black;
        font-family:'Perpetua Titling MT','Microsoft Yahei'; font-size: 1.8rem; font-weight:bold;" shape="circle" @click="handleOK">OK</Button>
    </div>
    
    <!--点击分类按钮之后弹出的模态框-->
    <Modal @on-visible-change="onVisibleChange" v-model="confirmModal" :styles="{top: '16rem', width: '24rem', fontFamily: 'Perpetua Titling MT,Microsoft YaHei'}" footer-hide="isHideFooter">
      <slot name="header">
        <p 
          style="width:109%; height: 2.4rem; text-align:center; 
          font-size:1.2rem; font-weight:bold; margin-left:-1.0rem; margin-bottom: 0.1rem;
          margin-top:-0.3rem; border-bottom: 0.01rem solid #e8eaec;">{{modalTitle}}</p>
      </slot>
      <p v-if="modalStep==0" style="text-align:center; font-size:1.1rem; font-weight:bold; margin-top:2rem;">{{modalContent}}</p>
      <div style="width: 100%; margin-top:1rem;" v-if="modalStep==1">
        <p style="text-align:center; font-size:1.1rem; font-weight:bold; margin-top:2rem;">CHOOSE ONE AS AVATAR</p>
        <div style="width:18rem; margin-left:auto; margin-right:auto;">
          <div 
            style="width: 15rem; margin-left:auto; 
            margin-right:auto; margin-top:2rem;">
            <Row v-for="i in rowNum">
              <Col span="8" v-for="j in colNum(i)">
                <img :class="{chosenImg:isChosenImg(i,j)}"
                  style="width:90%; height:90%;" :src = "imgsPath(i, j)" 
                  @click="choseAvatar(i, j)" />
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div v-if="modalStep==2">
        <input
          style="width:19rem; height:3rem;
          margin-top:1.5rem; margin-left: 1.7rem; 
          border-radius:5rem 5rem 5rem 5rem;
          border:solid 0.05rem black; color:black;
          text-indent:2rem; font-size:1.2rem;
          font-family: 'Perpetua Titling MT','Microsoft YaHei'; outline:none;
          text-align:center;" autofocus
          placeholder="CHANNEL CODE" v-model="user.channelNum"
        ></input>
      </div>
      <div 
        style="width:109%; height: 2.8rem; text-align:center; 
        font-size:1.2rem; font-weight:bold; margin-left:-1.0rem; margin-bottom: 0.1rem;
        margin-top:2rem; border-top: 0.01rem solid #e8eaec; ">
        <Button 
          style="margin-top: 0.8rem; width:4.8rem; height:2.5rem; border:0.09rem solid black;
          font-family:'Perpetua Titling MT','Microsoft Yahei'; font-size: 0.8rem; font-weight:bold;
          margin-right:1rem; float:right; dispaly:inline-block;"
          shape="circle" @click="modalOK">
          OK
        </Button>
        <Button 
          style="text-indent:-0.3rem; margin-top: 0.8rem; width:4.8rem; height:2.5rem; border:0.09rem solid white;
          font-family:'Perpetua Titling MT','Microsoft Yahei'; font-size: 0.8rem; font-weight:bold;
          margin-right:1rem; float:right; dispaly:inline-block; color:white;  background-color:black;"
          shape="circle" @click="modalCancel">
          CANCEL
        </Button>
      </div>
    </Modal>

  </div>
</template>
<script>
import {RadioGroup, Radio, Button, Modal, Row, Col} from 'view-design'
import {modalTitles, modalContents, avatarNum, baseURL} from '../../assets/js/modal.js'
import bus from '../../assets/js/bus.js'
export default{

  components:{
      RadioGroup, Radio, Button, Modal, Row, Col,
  },
  beforeDestroy() {
    bus.$emit('send',this.user);
  },
  data(){
    return{
      confirmModal: false,
      modalStep: 0,

      chosenHub: 0,

      isHideFooter: true,
      imgsColPerRow: 3,

      user:{
        nickName: "",
        avatarNum: 1,
        channelNum: "null",
        chosenHub: -1,
        roomNum: 0,
      },

      roomNum: 6,
      word:["文","体","科","政","经","生"]
    }
  },
  computed:{
    //介绍弹窗标题
    modalTitle(){
      return modalTitles[this.chosenHub];
    },
    //介绍弹窗内容
    modalContent(){
      return modalContents[this.chosenHub];
    },
    //计算图片排数
    rowNum(){
      const colPerRow = this.imgsColPerRow;
      return Math.floor((avatarNum+colPerRow-1)/colPerRow);
    },
    //计算图片每排有多少图片
    colNum(){
      return function (rowNum){
        const colPerRow = this.imgsColPerRow;
        if(rowNum*colPerRow <= avatarNum){
          return colPerRow;
        }else{
          return avatarNum-(rowNum-1)*colPerRow;
        }
      }
    },
    //返回图片路径
    imgsPath(){
      return function(i,j){
        const ColPerRow = this.imgsColPerRow;
        var ImgURL = baseURL + String((i-1)*ColPerRow+j)+".png";
        return require("../../"+ ImgURL);
      }
    }
  },
  methods:{
    onVisibleChange(){
      this.modalStep=0;
    },
    modalCancel(){
      this.confirmModal=false;
      this.modalStep = 0;
      this.user.avatarNum = -1;
      this.user.channelNum = "";
    },
    modalOK(){
      if(this.modalStep == 0){
        this.modalStep++;
      }else if(this.modalStep==1){
        if(this.user.avatarNum == -1){
          alert("Please Chose a Avatar!");
          return;
        }
        if(this.chosenHub==1){
          this.modalStep++;
        }else{
          this.confirmModal = false;
          this.modalStep = 0;
        }
      }else if(this.modalStep==2){
        var reg = /^\d{4}$/;
        if(!reg.test(this.user.channelNum)){
          alert("Please Input Four Digit Number!");
          return;
        }
        this.confirmModal=false;
        this.modalStep = 0;
      }
    },
    isChosenButton(i){
      return this.chosenHub == i;
    },
    isChosenImg(i,j){
      var test =  this.user.avatarNum == (i-1)*this.imgsColPerRow + j;
      if(test){
        return true;
      }
    },
    isChosenRoom(i){
      return this.user.roomNum == i-1;
    },
    chooseRoom(i){
      this.user.roomNum = i-1;
    },
    handleOK(){
      if(this.user.nickName == ""){
        alert("Please Enter Your User Name");
        return;
      };
      this.$router.push({
        name: 'chatHubPage',
      });
      this.user.chosenHub = this.chosenHub;
    },
    choseAvatar(i, j){
      this.user.avatarNum = (i-1)*this.imgsColPerRow + j;
    },
  }
}
</script>
<style scoped>
::-webkit-input-placeholder {
  color:grey;
  font-size: 1.2rem;
  text-indent: -1rem;
  font-family: Perpetua Titling MT, Microsoft YaHei;
}
.ivu-radio-group-button .ivu-radio-wrapper:after, .ivu-radio-group-button .ivu-radio-wrapper:before{
  width:0;
}

.ivu-radio-group-button .ivu-radio-wrapper:after, .ivu-radio-group-button .ivu-radio-wrapper:after{
  width:0;
}
input:focus{
  background-color:#fffbf0;
  border: 0.1rem solid skyblue !important;
}
.ivu-radio-group-button .ivu-radio-wrapper[data-v-014f2708]:after, .ivu-radio-group-button .ivu-radio-wrapper[data-v-014f2708]:after{
  width:0;
}
.chosenButton{
  background-color:#fffbf0;
  border: 0.05rem solid black !important;
}
.chosenImg{
  border: 0.14rem solid black !important;
}
.ivu-modal-header p, .ivu-modal-header-inner{
  text-align:center;
}
.chosenRoom{
  background: black !important;
  color: white;
}
.roomButton{
  background: white;
  height: 5rem;
  border: solid black 0.05rem;
  width: 13%;
  float: left;
  margin-left: 3%;
  margin-top: auto;
  margin-bottom: auto;
  text-align:center;
  padding: auto auto;
  font-size: 3rem;
  font-family: "STSong";
  font-weight: bold;
  border-radius: 2.1rem;
}
.roomButtonContainer{
  margin-top: -1rem;
  width: 100%;
  height: 8rem;
  margin-bottom: 2rem;
  display: inline-block;
}
.roomButton:hover{
  background: brown;
  color: white;
  cursor: pointer;
}
</style>

