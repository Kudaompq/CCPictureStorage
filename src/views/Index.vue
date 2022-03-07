<template>
<div>
  <Nav></Nav>
  <div class="el-main">
    <keep-alive include="Home">
      <router-view/>
    </keep-alive>
  </div>
  <Footer></Footer>
</div>
</template>

<script>
import Nav from "@/components/Nav";
import Footer  from "@/components/Footer";
export default {
  name: "Index",
  components:{Nav,Footer}
}
</script>

<style scoped>
.main{
  margin-top: 20px !important;
  flex: 1 !important;
}
</style>