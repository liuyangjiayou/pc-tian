<template>
  <el-table
    :data="tableData"
    empty-text="暂无数据"
    style="width: 100%;margin-bottom: 20px;"
    row-key="id"
    border
    default-expand-all
    :tree-props="{children: 'all_children', hasChildren: 'hasChildren'}">
    <el-table-column
      prop="id"
      label="id"
      width="180">
    </el-table-column>
    <el-table-column
      prop="org_name"
      label="机构名称"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="申请人姓名"
      width="180">
    </el-table-column>
    <el-table-column
      prop="org_username"
      label="账号"
      width="180">
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template v-slot="{ row }">
        <span>{{ row.org_status === 1 ? '审核通过' : '未审核' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template v-slot="{ row }">
        <el-button v-if="row.org_status !== 1 && userInfo.type === 1" type="text" @click="handlerPass(row)">通过</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getLower, passLower } from '@/api/user'

export default {
  data() {
    return {
      tableData: []
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
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
            await passLower({ status: 1, id: row.id })
            this.getList()
            instance.confirmButtonLoading = false
            done()
          } else {
            done()
          }
        }
      })
    },
    getList() {
      getLower().then(res => {
        this.tableData = res.list
      })
    }
  }
}
</script>

<style scoped>

</style>
