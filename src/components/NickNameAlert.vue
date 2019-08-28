<template>
<div class="modal-backdrop" v-if="display">
  <div class="modal">
    <div class="hd">
      输入你的昵称
    </div>

    <div class="bd">
      <input type="text" class="form-control" v-model="nickName">
    </div>

    <div class="ft">
      <button type="button" class="btn btn-default ensure" v-on:click="Ensure">
        确认
      </button>
    </div>
  </div>
</div>
</template>

<script>
export default{
  name:"NickNameAlert",
  props:{
    display:{
      type:Boolean,
      default:false,
    },
  },
  data(){
    return{
      nickName:"",
    }
  },
  methods:{
    Ensure(){
      if(this.nickName == ""){
        alert("请输入一个昵称！");
      }
      else{
        this.$emit("listenToNickName",this.nickName);
        this.display = false;
      }
      
    },
  },
  watch:{
  }
}
</script>
<style scoped>
.modal-backdrop {
  width: 1000px;
  height:100px;
  margin-left:550px;
  margin-top:200px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border:3px 3px 3px 3px;
}
.modal {
  background-color: #fff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x:auto;
  display: flex;
  width:1000px;
  height:220px;
  margin-left:auto;
  margin-right:auto;
  margin-top:200px;
  flex-direction: column; 
}
.hd{
  border-bottom: 1px solid #eee;
  color: #4aae9b;
  font-size:30px;
  justify-content: space-between;
}
.ft{
  border-top: 1px solid #eee;
  justify-content: flex-end;
}
.bd{
  position: relative;
  padding: 20px 10px;
}
.form-control{
  width:100%;
  height:50px;
  font-size:40px;
  margin-left:auto;
  margin-right:auto;
}
.ensure{
  margin-top:10px;
  width:100px;
  height:50px;
  font-size:23px;
  float:right;
  margin-right:50px;
}
</style scoped>