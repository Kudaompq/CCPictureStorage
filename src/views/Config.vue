<template>
  <div>
    <el-row>
      <el-col :span="8" :offset="8">
        <el-input placeholder="请输入token进行初始化" v-model="token" :clearable="true" @keyup.native.enter="searchUser">
          <el-button slot="append" icon="el-icon-search" @click="searchUser">查询</el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8" :offset="8" class="center">
        <el-avatar :size="100" :src="userInfo.avatar_url">User</el-avatar>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8" :offset="8" class="center">
        <span>当前用户是：{{ userInfo.login }}</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8" :offset="8" class="center">
        <el-button type="primary" size="medium" icon="el-icon-check" :disabled="isSave" @click="saveUser(true)">保存配置</el-button>
        <el-button type="info" size="medium" icon="el-icon-close" @click="saveUser(false)">清除配置</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getUserInfo} from "@/api/github";

export default {
  name: "Config",
  data(){
    return{
      token :'',
      userInfo: {
        login: '未配置',
        avatar_url: ''
      },
      isSave: true
    }
  },
  created() {
    this.token = localStorage.getItem("githubToken")
    const userInfo = localStorage.getItem("githubUserInfo")
    if (this.token && userInfo){
      this.userInfo = JSON.parse(userInfo)
      this.isSave = false
    }else{
      this.userInfo = {login: '未配置'}
    }
  },
  methods:{
    searchUser(){
      getUserInfo(this.token).then(res => {
        this.userInfo = res
        this.isSave = false
      })
    },
    saveUser(save){
      if (save){
        localStorage.setItem('githubToken',this.token)
        localStorage.setItem('githubUserInfo', JSON.stringify(this.userInfo))
        this.msgSuccess('保存成功')
      }else {
        localStorage.removeItem('githubToken')
        localStorage.removeItem('githubUserInfo')
        this.msgSuccess('清除成功')
      }
    }
  }
}
</script>

<style scoped>
.el-row + .el-row {
  margin-top: 20px;
}
</style>