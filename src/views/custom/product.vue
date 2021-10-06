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
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="userInfo.type !== 2" label="选择工会">
        <el-select v-model="form.org_id" placeholder="请选择" clearable>
          <el-option
            v-for="item in lowerList"
            :key="item.id"
            :label="item.org_name"
            :value="item.id">
          </el-option>
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
      >
      </el-table-column>
      <el-table-column
        prop="ranks_name"
        label="队伍名称"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="org_name"
        label="所属工会"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="pro_name"
        label="所属项目"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="ranks_link_name"
        label="联系人"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="ranks_link_phone"
        label="联系电话"
        width="130"
      >
      </el-table-column>
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
          <el-button v-if="userInfo.type === 2 && row.ranks_status && setting.is_up === 2" type="text" @click="addUprankFile(row)">上传作品</el-button>
          <el-button v-if="userInfo.type === 3 && setting.is_df === 2" type="text" @click="handlerScore(row)">打分</el-button>
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
      width="30%">
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
      width="30%">
      <el-form ref="upDateForm" inline :model="upDateData">
        <el-form-item label="作品名" prop="ranks_video_name" verify>
          <el-input v-model="upDateData.ranks_video_name" placeholder="请填写作品名" />
        </el-form-item>
        <el-upload
          ref="upload"
          class="upload-demo"
          :headers="{
            Authorization: `Bearer ${$store.state.user.token}`
          }"
          :data="upDateData"
          action="https://axmtadmin.zhyell.com/api/v1/rank/uprankvideo"
          :auto-upload="false"
          :on-success="upSuccess"
          :file-list="fileList">
          <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
          <div class="el-upload__tip" slot="tip">请上传MP4格式，且不超过500M</div>
        </el-upload>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">开始上传</el-button>
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
      fileList: [],
      upDateData: {
        rank_id: '',
        ranks_video_name: ''
      },
      setting: {
        is_bm: '',
        is_df: '',
        is_up: ''
      }
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
    async submitUpload() {
      await this.$refs.upDateForm.validate()
      this.$refs.upload.submit()
    },
    // 上传作品
    addUprankFile(data) {
      this.upDateData.rank_id = data.id
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
