<template>
  <div>
    <el-form inline>
      <el-form-item label="队伍名称">
        <el-input v-model="form.rank_name" placeholder="请输入作品关键字名称" clearable />
      </el-form-item>
      <el-form-item label="选择项目">
        <el-select v-model="form.project_id" placeholder="请选择" clearable>
          <el-option
            v-for="item in broadcastList"
            :key="item.id"
            :label="item.pro_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="userInfo.type !== 2" label="选择工会">
        <el-select v-model="form.org_id" placeholder="请选择" clearable>
          <el-option
            v-for="item in lowerList"
            :key="item.id"
            :label="item.org_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">搜索</el-button>
      </el-form-item>
    </el-form>
    <div v-if="userInfo.type === 2 && setting.is_bm === 2" class="flex align-center justify-end">
      <el-button type="primary" plain class="mb10" @click="addRank">赛事报名</el-button>
    </div>
    <el-table
      empty-text="暂无数据"
      border
      :data="tableData"
    >
      <el-table-column
        prop="id"
        label="队伍编号"
        width="100"
      />
      <el-table-column
        prop="ranks_name"
        label="队伍名称"
        width="100"
      />
      <el-table-column
        prop="org_name"
        label="所属工会"
        width="200"
      />
      <el-table-column
        prop="pro_name"
        label="所属项目"
        width="100"
      />
      <el-table-column
        prop="ranks_link_name"
        label="联系人"
        width="100"
      />
      <el-table-column
        prop="ranks_link_phone"
        label="联系电话"
        width="130"
      />
      <el-table-column
        label="队伍分数"
      >
        <template v-slot="{ row }">
          <span>{{ row.rank_score }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="pro_name"
        label="队伍状态"
      >
        <template v-slot="{ row }">
          <span>{{ row.ranks_status ? '已通过' : '未审核' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template v-slot="{ row }">
          <el-button type="text" @click="viewDetails(row)">查看信息</el-button>
          <el-button v-if="userInfo.type === 2" type="text" @click="handlerEdit(row)">修改</el-button>
          <el-button v-if="(userInfo.type === 2 && row.ranks_status && setting.is_up) === 2 && ![3,4].includes(row.pro_type)" type="text" @click="addUprankFile(row)">上传作品</el-button>
          <el-button v-if="userInfo.type === 3 && [1,2].includes(row.pro_type) && setting.is_df === 2" type="text" @click="handlerScore(row)">打分</el-button>
          <el-button v-if="userInfo.type !== 2 && row.ranks_status !== 1" type="text" @click="handlerPass(row)">通过</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block mt20">
      <el-pagination
        layout="prev, pager, next"
        :total="count"
        @current-change="handlerPageChange"
      />
    </div>
    <el-dialog
      title="打分"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form ref="formScore" :model="FormScore">
        <el-form-item prop="score" verify number error-message="请输入数字">
          <el-input v-model="FormScore.score" placeholder="" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" :loading="scoreLoading" @click="addSubScore">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="上传作品"
      :visible.sync="upDateFileVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="30%"
    >
      <el-form :key="uploadKey" ref="upDateForm" inline :model="upDateData">
        <el-upload
          ref="upload"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :http-request="handleHttpRequest"
          :headers="uploadHeaders"
          :limit="1"
          :disabled="disabled"
          :auto-upload="false"
          :multiple="false"
          action=""
          :file-list="fileList"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">开始上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传{{ allow.file.join('/') }}文件，且不超过{{ allow.size }}M</div>
        </el-upload>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addScore, chstatusPass, getBroadCastList, getLower, getProduct, setting } from '@/api/user'
function formScore() {
  return {
    rank_id: '',
    score: ''
  }
}
import { getOssToken, uploadFile } from '@/api/user'
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
export default {
  name: 'Product',
  data() {
    return {
      tableData: [],
      scoreLoading: false,
      // 打分表单
      FormScore: formScore(),
      count: 0,
      form: {
        org_id: '',	// 工会id，获取下级工会
        project_id: '',	// 项目id
        rank_name: '', //	模糊查询
        page: this.$route.query.page || 0, //	页数
        pagesize: 10 //	每页数量
      },
      // 活动列表/项目
      broadcastList: [],
      // 机构/工会
      lowerList: [],
      // 打分
      dialogVisible: false,
      // 上传作品
      upDateFileVisible: false,
      uploadKey: 1,
      allow: {
        file: ['.mp4'],
        size: 500 // 单位是M
      },
      upDateData: {
        rank_id: '',
        ranks_video_name: ''
      },
      setting: {
        is_bm: '',
        is_df: '',
        is_up: ''
      },
      dataObj: {},
      checkpoint: 0,
      expiration: '',
      fileList: [],
      files: 1,
      uploadHeaders: {
        authorization: '*'
      },
      disabled: false
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  mounted() {
    setting().then(res => {
      this.setting = res.setting
    })
    getBroadCastList().then(res => {
      this.broadcastList = res.list
    })
    this.userInfo.type !== 2 && getLower().then(res => {
      this.lowerList = res.list
    })
    this.getList()
    this.getAliToken()
  },
  methods: {
    // 查看详情
    viewDetails(data) {
      this.$router.push({ name: 'Details', query: { id: data.id, status: data.ranks_status, page: this.form.page }})
    },
    // 通过按钮
    async handlerPass(row) {
      this.$msgbox({
        title: '提示',
        message: '确定要通过这个申请吗？',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async(action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '正在通过中...'
            await chstatusPass({ status: 1, rank_id: row.id }).finally(() => {
              instance.confirmButtonLoading = false
            })
            this.getList()
            instance.confirmButtonLoading = false
            done()
          } else {
            done()
          }
        }
      })
    },
    upSuccess(response, file, fileList) {
      if (response.code !== 0) {
        file.status = 'error'
      }
      this.$message({
        message: response.msg,
        type: response.code === 0 ? 'success' : 'error'
      })
    },
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
    getAliToken() {
      return new Promise((resolve, reject) => {
        getOssToken().then(res => {
          const { Expiration: expiration, AccessKeyId: tempAk, AccessKeySecret: tempSk, SecurityToken: token } = res?.[0] || {}
          this.expiration = expiration
          this.dataObj = {
            region: 'oss-cn-zhangjiakou',
            bucket: 'jtyw-sghysydh',
            secure: true,
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
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },
    async handleHttpRequest(option) { // 上传OSS
      try {
        const vm = this
        vm.disabled = true
        const client = Client(this.dataObj); const file = option.file
        // 随机命名
        const fileType = (file.name.split('.').pop()).toLowerCase()
        const random_name = 'zuopin/' + this.random_string(6) + '_' + new Date().getTime() + '.' + fileType
        if (!this.allow.file.includes('.' + fileType)) {
          this.$message.warning(`仅允许上传${this.allow.file.join('/')}格式！`)
          option.onError(`仅允许上传${this.allow.file.join('/')}格式！`)
          return
        }
        if (file.size > this.allow.size * 1024 * 1024) {
          this.$message.warning(`上传视频大小不能超过${this.allow.size}M！`)
          option.onError(`上传视频大小不能超过${this.allow.size}M！`)
          return
        }
        // 分片上传文件
        await client.multipartUpload(random_name, file, {
          checkpoint: this.checkpoint,
          progress: async function(p, cpt) {
            this.checkpoint = cpt
            const e = {}
            e.percent = p * 100
            option.onProgress(e)
          }
        }).then(({ res }) => {
          if (res.statusCode === 200) {
            option.onSuccess(random_name)
            console.log('上传成功', res)
            return res
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
    // 提交参数 todo
    handleSuccess(response, file, fileList) {
      console.log('ranks_video', 'https://fydh.hebei.com.cn/' + response)
      uploadFile({ rank_id: this.upDateData.rank_id, ranks_video: 'https://fydh.hebei.com.cn/' + response })
    },
    // 随机生成文件名
    random_string(len) {
      len = len || 32
      const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678'; const maxPos = chars.length; let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    },

    // 上传作品
    addUprankFile(data) {
      this.upDateData.rank_id = data.id
      this.uploadKey++
      this.upDateFileVisible = true
    },

    // 开始打分
    async addSubScore() {
      await this.$refs.formScore.validate()
      this.scoreLoading = true
      await addScore(this.FormScore).finally(() => {
        this.scoreLoading = false
      })
      this.FormScore = formScore()
    },
    // 给队伍打分
    handlerScore(data) {
      this.FormScore.rank_id = data.id
      this.dialogVisible = true
    },
    // 给队伍打分取消按钮
    close() {
      this.FormScore = formScore()
      this.dialogVisible = false
      this.upDateFileVisible = false
    },
    // 修改队伍
    handlerEdit(data) {
      this.$router.push({ name: 'ProductAdd', query: { id: data.id }})
    },
    // 开始查询
    onSubmit() {
      this.getList()
    },
    handlerPageChange(page) {
      this.form.page = page
      this.getList()
    },
    getList() {
      getProduct(this.form).then(res => {
        this.tableData = res.list
        this.count = res.count
      })
    },
    // 添加队伍名称
    addRank() {
      this.$router.push({ name: 'ProductAdd' })
    }
  }
}
</script>

<style scoped>

</style>
