<template>
  <!--在此处添加渲染的内容-->
  <div>
    <el-upload
      ref="upload"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :http-request="handleHttpRequest"
      :headers="uploadHeaders"
      :limit="files"
      :disabled="disabled"
      multiple
      action=""
      :file-list="fileList"
    >
      <!--      <i class="el-icon-upload" />-->
      <!--      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>-->
      <!--      <div slot="tip" class="el-upload__tip">上传文件大小不能超过 1G</div>-->
      <!--      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>-->
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">上传文件大小不能超过 1G</div>
    </el-upload>
  </div>
</template>

<script>
import { getOssToken } from '@/api/user'
import OSS from 'ali-oss'
function Client(data) {
  // 后端提供数据
  return new OSS({
    region: data.region, // oss-cn-beijing-internal.aliyuncs.com
    accessKeyId: data.accessKeyId,
    accessKeySecret: data.accessKeySecret,
    stsToken: data.stsToken,
    bucket: data.bucket
  })
}
// 将渲染的内容导出
export default {
  components: {},
  props: {},
  data() {
    return {
      percentage: 0,
      ClientObj: null,
      dataObj: {},
      expiration: '',
      fileList: [],
      files: 10,
      uploadHeaders: {
        authorization: '*'
      },
      disabled: false
    }
  },
  computed: {},
  created() {
    this.getAliToken()
  },
  mounted() {
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit()
    },
    getDate() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
      const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
      const hh = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`
      const mm = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`
      return `${year}${month}${day}${hh}${mm}`
    },
    getAliToken() { // 获取Token
      // const query = this.$route.query || {}
      // this.dataObj = {
      //   region: query.region,
      //   bucket: query.bucket,
      //   accessKeyId: query.ak,
      //   accessKeySecret: query.sk,
      //   stsToken: query.token
      // }
      // return Promise.resolve(true)
      return new Promise((resolve, reject) => {
        getOssToken().then(res => {
          console.log(res)
          const { Expiration: expiration, AccessKeyId: tempAk, AccessKeySecret: tempSk, SecurityToken: token } = res?.[0] || {}
          this.expiration = expiration
          this.dataObj = {
            region: 'oss-cn-qingdao',
            bucket: 'testmall',
            accessKeyId: tempAk,
            accessKeySecret: tempSk,
            stsToken: token
          }
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    },
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        this.getAliToken().then(response => {
          if (response) {
            console.log('beforeUpload 1')
            resolve(response)
          } else {
            console.log('beforeUpload 2')
            reject(response)
          }
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },
    async handleHttpRequest(option) { // 上传OSS
      console.log('分片上传文件')
      try {
        const vm = this
        vm.disabled = true
        console.log('分片上传文件', this.dataObj)
        const client = Client(this.dataObj); const file = option.file
        // 随机命名
        const random_name = this.random_string(6) + '_' + new Date().getTime() + '.' + file.name.split('.').pop()
        // 分片上传文件
        console.log('分片上传文件')
        await client.multipartUpload(random_name, file, {
          progress: async function(p) {
            const e = {}
            e.percent = p * 100
            option.onProgress(e)
          }
        }).then(({ res }) => {
          console.log(res)
          if (res.statusCode === 200) {
            // option.onSuccess(ret)
            return res.requestUrls
          } else {
            vm.disabled = false
            option.onError('上传失败')
          }
        }).catch(error => {
          console.error(error)
          vm.disabled = false
          option.onError('上传失败')
        })
      } catch (error) {
        console.error(error)
        this.disabled = false
        option.onError('上传失败')
      }
    },
    handleSuccess(response, file, fileList) {
      console.log(response)
      console.log(file)
      console.log(fileList)
    },
    // 随机生成文件名
    random_string(len) {
      len = len || 32
      const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678'; const maxPos = chars.length; let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    }
  }
}
</script>

<style scoped>
/**渲染内容的样式**/

</style>
