<template>
  <div>
    <div class="mb20">
      <el-button size="mini" @click="$router.go(-1)">返回列表</el-button>
    </div>
    <el-form ref="form" :model="formDate" style="width: 380px;" label-width="auto">
      <el-form-item label="选择项目" prop="project_id" verify>
        <el-select v-model="formDate.project_id" placeholder="请选择" clearable>
          <el-option
            v-for="item in broadcastList"
            :key="item.id"
            :label="item.pro_name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择工会" prop="org_id" verify>
        <el-select v-model="formDate.org_id" placeholder="请选择" clearable>
          <el-option
            v-for="item in lowerList"
            :key="item.id"
            :label="item.org_name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="队伍名称" prop="ranks_name" verify>
        <el-input v-model="formDate.ranks_name" placeholder="请填写" />
      </el-form-item>
      <template v-for="(item, index) in formDate.ranks_users">
        <div :key="index">
          <div class="mt30 mb20 flex align-center justify-between">
            <strong>参赛人员{{ index + 1 }}</strong>
            <el-button v-if="formDate.ranks_users.length > 1" type="text" @click="delPerson(index)">取消</el-button>
          </div>
          <el-form-item v-if="formDate.ranks_users.length > 0" label="姓名" :prop="`ranks_users[${index}].user_name`" verify>
            <el-input v-model="item.user_name" placeholder="请填写姓名" />
          </el-form-item>
          <el-form-item v-if="formDate.ranks_users.length > 0" label="手机号" :prop="`ranks_users[${index}].user_phone`" verify phone>
            <el-input v-model="item.user_phone" placeholder="请填写手机号" />
          </el-form-item>
          <el-form-item v-if="formDate.ranks_users.length > 0" label="身份证号" :prop="`ranks_users[${index}].user_idcard`" verify>
            <el-input v-model="item.user_idcard" placeholder="请填写身份证号" />
          </el-form-item>
        </div>
      </template>
      <el-button v-if="formDate.ranks_users.length < 5" type="text" @click="addPerson">添加一个参赛人员</el-button>
      <el-form-item class="pt20">
        <el-button type="primary" :loading="loading" @click="submit">添加</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addProduct, getBroadCastList, getLower, getProductEdit } from '@/api/user'

export default {
  name: 'AddProduct',
  data() {
    return {
      formDate: {
        project_id: '', // 项目ID
        org_id: '', // 工会id
        ranks_name: '', // 队伍名字
        ranks_users: [
          {
            user_name: '',
            user_phone: '',
            user_idcard: ''
          }
        ], // 队员信息整理的json
        // 填写rank_id时为修改
        rank_id: this.$route.query.id || ''
      },
      loading: false,
      broadcastList: [],
      // 机构/工会
      lowerList: []
    }
  },
  mounted() {
    getBroadCastList().then(res => {
      this.broadcastList = res.list
    })
    getLower().then(res => {
      this.lowerList = res.list
    })
    this.getProductEdit()
  },
  methods: {
    // 获取详情
    getProductEdit() {
      getProductEdit({ rank_id: this.$route.query.id }).then(res => {
        console.log(res)
        this.formDate.project_id = res.rank_info.project_id // 项目ID
        this.formDate.org_id = res.rank_info.ranks_org_id // 工会id
        this.formDate.ranks_name = res.rank_info.ranks_name // 队伍名字
        this.formDate.ranks_users = res.rank_users
      })
    },
    // 删除人员
    delPerson(index) {
      this.$delete(this.formDate.ranks_users, index)
    },
    // 添加人员
    addPerson() {
      this.formDate.ranks_users.push({
        user_name: '',
        user_phone: '',
        user_idcard: ''
      })
    },
    // 提交
    async submit() {
      await this.$refs.form.validate()
      this.loading = true
      await addProduct(this.formDate).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
