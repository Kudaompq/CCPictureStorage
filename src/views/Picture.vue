<template>
  <div>
    <el-row>
      <el-select v-model="activeRepos" placeholder="请选择仓库" :filterable="true" @change="changeRepos" style="min-width: 300px">
        <el-option v-for="item in reposList" :key="item.id" :label="item.name" :value="item.name"></el-option>
      </el-select>
      <el-cascader
          :key = "pathShow"
          v-model="activePath"
          placeholder="请选择目录"
          :options="pathArr"
          :props="pathProps"
          :disabled="!activeRepos"
          style="min-width: 300px">
      </el-cascader>
      <el-button type="primary" size="medium" icon="el-icon-search" :disabled="!activeRepos" @click="search">Search</el-button>
      <el-switch v-model="isCDN" active-text="CDN" inactive-text="Origin" :disabled="!activeRepos"></el-switch>
      <el-button type="primary" size="medium" icon="el-icon-upload" :disabled="!activeRepos" @click="isDrawerShow = !isDrawerShow">Upload</el-button>
    </el-row>
    <el-row v-viewer>
      <div class="image-container" v-for="(file,index) in fileList" :key="index">
        <el-image :src="imgURL(file)" fit="scale-down"></el-image>
        <div class="image-content">
          <div class="info">
            <span>{{ file.name }}</span>
          </div>
          <div class="icons">
            <el-tooltip class="item" effect="dark" content="复制CDN链接" placement="bottom">
              <i class="icon el-icon-link" @click="copy(file)"></i>
            </el-tooltip>
            <i class="icon el-icon-delete" @click="delFile(file)"></i>
          </div>
        </div>
      </div>
    </el-row>
    <el-drawer title="上传文件" :visible.sync="isDrawerShow" direction="rtl" size="40%" :wrapperClosable="false" :close-on-press-escape="false">
      <el-row>
        <el-radio v-model="nameType" label="1">使用源文件名</el-radio>
        <el-radio v-model="nameType" label="2">使用UUID文件名</el-radio>
        <el-button size="small" type="primary" icon="el-icon-upload" v-throttle="[submitUpload,`click`,3000]">确定上传</el-button>
      </el-row>
      <el-row>
        当前目录：{{realpath}}
      </el-row>
      <el-row>
        <el-switch v-model="isCustomPath" active-text="自定义目录"></el-switch>
        <el-input placeholder="例：oldFolder/newFolder/" v-model="customPath" :disabled="!isCustomPath" size="medium" style="margin-top: 10px"></el-input>
      </el-row>
      <el-upload ref="uploadRef" action="" :http-request="upload" drag multiple :file-list="uploadList" list-type="picture" :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-drawer>
  </div>
</template>

<script>
import {getUserRepos, getReposContents, upload, delFile} from "@/api/github";
import {isImgExt} from "@/utils/validator";
import {randomUUID} from "@/utils/uuid";
import {taskQueue} from "@/utils/task-queue";
import {copy} from '@/utils/copy'
export default {
  name: "Picture",
  data(){
    return{
      reposList: [],
      pathArr: [{value: '',label: 'root'}],
      activeRepos: '',
      activePath: [''],
      pathProps: {
        lazy: true,
        checkStrictly: true,
        lazyLoad: async (node,resolve) => {
          let path = node.path.join("/")
          let nodes = []
          await this.getReposContents(nodes,path)
          resolve(nodes)
        }
      },
      fileList:[],
      pathShow: 0,
      isCDN:true,
      isDrawerShow: false,
      nameType: '1',
      isCustomPath: false,
      customPath: '',
      uploadList: []
    }
  },
  created() {
    const token = localStorage.getItem('githubToken')
    const userInfo = localStorage.getItem('githubUserInfo')
    if (token && userInfo){
      this.userInfo = JSON.parse(userInfo)
      this.getRepos()
    }else{
      this.msgError("请先配置Token")
      this.$router.push('/config')
    }
  },
  computed:{
    realpath(){
      if (this.isCustomPath) {
        return `/${this.userInfo.login}/${this.activeRepos}/${this.customPath}`
      }
      return `/${this.userInfo.login}/${this.activeRepos}${this.activePath.join('/')}/`
    }
  },
  methods:{
    // 获取用户仓库
    getRepos(){
      getUserRepos(this.userInfo.login).then(res => {
        this.reposList = res
      })
    },
    changeRepos(){
      this.pathShow++
      this.activePath = ['']
      this.fileList = []
    },
    // 遍历目录树
    async getReposContents(arr,path){
      await getReposContents(this.userInfo.login,this.activeRepos,path).then(res =>{
        res.forEach(item =>{
          if (item.type === 'dir'){
            // 让所有节点都是非叶子节点
            arr.push({value: item.name,label :item.name,leaf:false})
          }
        })
      })
    },
    imgURL(file){
      return this.isCDN ? `https://cdn.jsdelivr.net/gh/${this.userInfo.login}/${this.activeRepos}/${file.path}` : file.download_url
    },
    search(){
      this.fileList = []
      let path = this.activePath.join("/")
      getReposContents(this.userInfo.login,this.activeRepos,path).then(res => {
        res.forEach(item => {
          if (item.type === 'file' && isImgExt(item.name)){
            this.fileList.push(item)
          }
        })
      })
    },
    copy(file){
      let imgURL = `https://cdn.jsdelivr.net/gh/${this.userInfo.login}/${this.activeRepos}/${file.path}`
      copy(imgURL)
      this.msgSuccess('复制成功')
    },
    upload(data){
      let reader = new FileReader()
      reader.readAsDataURL(data.file)
      reader.onload = (() => {
        let base64 = reader.result.split(",")[1]
        let fileName = data.file.name
        // 使用UUID作为文件名
        if (this.nameType === '2'){
          fileName = randomUUID() + fileName.substr(fileName.lastIndexOf("."))
        }
        //批量上传需要间隔时间，否则可能commit版本号冲突，返回409错误码，Status: 409 Conflict
        taskQueue(()=>this.push2Github(data,fileName,base64),1000)
      })
    },
    push2Github(data, fileName, base64) {
      let requestData = {
        message: "Add files via PictureHosting",
        content: base64,
      }

      let path = this.activePath.join('/')
      // 对自定义目录进行处理
      if (this.isCustomPath) {
        if (this.customPath === '/') {
          path = ''
        } else {
          path = this.customPath
          if (path.charAt(0) !== '/') {
            path = '/' + path
          }
          if (path.charAt(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1)
          }
        }
      }
      upload(this.userInfo.login,this.activeRepos,path,fileName,requestData).then(() =>{
        this.msgSuccess('上传成功')
        data.onSuccess()
      })
    },
    submitUpload(){
      this.uploadList = this.$refs.uploadRef.uploadFiles
      if (this.uploadList.length){
        // 触发el-upload 中 http-request 绑定的函数
        this.$refs.uploadRef.submit()
      }else{
        this.msgError("请先选择文件")
      }
    },
    delFile(file){
      this.$confirm("该操作将会永久删除该文件，是否删除？","提示",{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          message: 'Delete file via PictureHosting',
          sha: file.sha,
        }
        delFile(this.userInfo.login,this.activeRepos,file.path,data).then(() =>{
          this.msgSuccess('删除成功')
          this.search()
        }).catch(()=>{
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      })
    }
  }
}
</script>

<style scoped>
.el-select + .el-cascader, .el-cascader + .el-button, .el-button + .el-switch {
  margin-left: 10px;
}

.el-switch + .el-button {
  margin-left: 30px;
}
.el-row + .el-row{
  margin-top: 20px;
}

.image-container {
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  display: inline-block;
  margin: 0 2px;
}

.el-image {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.image-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-content .info {
  background: linear-gradient(0deg, transparent, rgba(0, 0, 0, .6));
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 6px;
  font-size: 12px;
  color: #fff;
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 2;
}

.image-content .info span {
  word-wrap: break-word;
}

.image-container:hover .image-content .info {
  opacity: 1;
  transition-duration: 0.25s;
}

.icons {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 2;
}

.icon {
  text-decoration: none;
  font-size: 22px;
  margin-left: 20px;
  transform: translateY(80px);
  cursor: pointer;
}

.image-container:hover .icon {
  transform: translateY(0px);
}

.icon:nth-child(1) {
  transition: transform 0.25s 0.05s, color 0.3s;
}

.icon:nth-child(2) {
  transition: transform 0.25s 0.1s, color 0.3s;
}

.icon:nth-child(3) {
  transition: transform 0.25s 0.15s, color 0.3s;
}

.icon:nth-child(1):hover {
  color: #409EFF;
}

.icon:nth-child(2):hover {
  color: #409EFF;
}

.icon:nth-child(3):hover {
  color: #F56C6C;
}

.image-content::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 0;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
  transition: 0.3s;
  z-index: 2;
}

.image-container:hover .image-content::before {
  height: 80px;
}
.el-drawer .el-row{
  margin-left: 20px;
  margin-right: 20px;
}
.el-drawer .el-upload{
  width: 100%;
}
</style>