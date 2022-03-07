<template>
<div>
  <el-row class="center">
    <h2>Quick Start</h2>
  </el-row>
  <el-row>
    <el-col :span="12" :offset="6">
      <el-steps :active="active" finish-status="success">
        <el-step title="创建一个Github仓库"></el-step>
        <el-step title="生成Github的Token"></el-step>
        <el-step title="使用"></el-step>
      </el-steps>
    </el-col>
  </el-row>
  <el-row class="center" v-viewer>
    <div v-if="active==0">
      <h3>
        <el-link href="https://github.com/new" target="_blank" type="primary">创建一个仓库</el-link>
        作为图床
      </h3>
      <img src="@/assets/image/help_img1.png" style="zoom: 80%"/>
    </div>
    <div v-if="active==1">
      <h3>生成Token</h3>
      <p>
        1.打开链接
        <el-link href="https://github.com/settings/tokens" target="_blank" type="primary">https://github.com/settings/tokens</el-link>
        点击 Generate new token 按钮
      </p>
      <p>
        2.在打开的 <b>New personal access token</b> 中选中<b>"public_repo"</b>，如下所示
      </p>
      <img src="@/assets/image/help_img2.png"/>
      <br>
      <p>3.然后点击 Generate token 按钮，即可生成一个token，如下：</p>
      <br>
      <img src="@/assets/image/help_img3.png"/>
      <p style="color: red"><b>4.生成的TOKEN只会显示一次。记得保存！！</b></p>
    </div>
    <div v-if="active==2">
      <h3>使用</h3>
      <p>配置Token</p>
      <img src="@/assets/image/config.png" alt="">
      <img src="@/assets/image/use.png" alt="">
    </div>
    <div v-if="active==3">
      <h1>恭喜您完成使用教程，可以开始使用啦！</h1>
    </div>
  </el-row>
  <el-row class="center">
    <el-button type="primary" @click="front" v-show="active">上一步</el-button>
    <el-button type="primary" @click="next">下一步</el-button>
  </el-row>
</div>
</template>

<script>

export default {
  name: "Home",
  data(){
    return {
      active: 0
    }
  },
  methods: {
    next() {
      if (this.active++ > 2) this.active = 0;
    },
    front(){
      this.active--
    }
  }

}
</script>

<style scoped>
.el-row + .el-row{
  margin-top: 20px;
}
h3 .el-link, p .el-link {
  font-size: inherit;
}
.el-link{
  color: #409EFF;
}
</style>