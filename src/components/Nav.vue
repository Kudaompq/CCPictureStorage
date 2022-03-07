<template>
<div>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect" >
    <el-menu-item index="home">Home</el-menu-item>
    <el-menu-item index="config">Config</el-menu-item>
    <el-menu-item index="picture">Picture</el-menu-item>
  </el-menu>
</div>
</template>

<script>
import router from "@/router";

export default {
  name: "Nav",
  data(){
    return{
      activeIndex: 'picture'
    }
  },
  methods:{
    handleSelect(key,keyPath){
      this.$router.push(`/${key}`)
    }
  },
  created() {
    this.activeIndex = this.$route.name
  }
}
</script>

<style scoped>

</style>