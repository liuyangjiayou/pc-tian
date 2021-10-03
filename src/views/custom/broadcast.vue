<template>
  <el-table
    border
    empty-text="暂无数据"
    :data="tableData"
  >
    <el-table-column
      prop="id"
      label="活动ID"
      width="180">
    </el-table-column>
    <el-table-column
      prop="pro_name"
      label="活动名称"
    >
    </el-table-column>
  </el-table>
</template>

<script>
import { getBroadCastList } from '@/api/user'

export default {
  name: 'Broadcast',
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    getBroadCastList().then(res => {
      this.tableData = res.list
    })
  }
}
</script>

<style scoped>

</style>
