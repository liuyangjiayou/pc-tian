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
      <el-form-item label="选择工会">
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
    <div class="flex align-center justify-end">
      <el-button type="primary" plain @click="addRank">赛事报名</el-button>
    </div>
    <el-table
      empty-text="暂无数据"
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
          <el-button type="text" @click="handlerEdit(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block mt20">
      <el-pagination
        layout="prev, pager, next"
        :total="tableData.length"
        @current-change="handlerPageChange"
      />
    </div>
  </div>
</template>

<script>
import { getBroadCastList, getLower, getProduct } from '@/api/user'

export default {
  name: 'Product',
  data() {
    return {
      tableData: [],
      form: {
        org_id: '',	// 工会id，获取下级工会
        project_id: '',	// 项目id
        rank_name: '', //	模糊查询
        page: 1, //	页数
        pagesize: 10 //	每页数量
      },
      // 活动列表/项目
      broadcastList: [],
      // 机构/工会
      lowerList: []
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  mounted() {
    getBroadCastList().then(res => {
      this.broadcastList = res.list
    })
    getLower().then(res => {
      this.lowerList = res.list
    })
    this.getList()
  },
  methods: {
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
