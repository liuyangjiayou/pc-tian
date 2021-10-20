<template>
  <div class="login-container">
    <!--  注册  -->
    <el-form ref="registerForm" :model="registerForm" class="login-form" auto-complete="on" label-position="left">
      <h5 class="title flex fs20 align-center justify-center">
        <el-image :src="logo" style="width: 250px;height: 200px" />
      </h5>
      <el-form-item prop="org_pid" verify>
        <div class="flex align-center">
          <span class="svg-container">
            <i class="el-icon-s-tools fs16" />
          </span>
          <el-cascader
            v-model="registerForm.org_pid"
            :options="orgs"
            :props="{
              value: 'id',
              label: 'org_name',
              children: 'child',
              disabled: 'can_use',
            }"
            placeholder="请选择您归属的工会"
            class="org-select"
            @change="handleChange">
          </el-cascader>
          <!--<el-select v-model="registerForm.org_pid" class="org-select" filterable no-match-text="无搜索结果" placeholder="请选择您归属的工会">-->
          <!--  <el-option-->
          <!--    v-for="item in orgs"-->
          <!--    :key="item.id"-->
          <!--    :label="item.org_name"-->
          <!--    :value="item.id"-->
          <!--  />-->
          <!--</el-select>-->
        </div>
      </el-form-item>
      <el-form-item v-if="registerForm.org_pid !== ''" prop="org_name" verify>
        <div class="flex align-center">
          <span class="svg-container">
            <i class="el-icon-s-ticket fs16" />
          </span>
          <el-input
            v-model="registerForm.org_name"
            placeholder="请填写基层工会名称"
            type="text"
          />
        </div>
      </el-form-item>
      <el-form-item prop="name" verify>
        <div class="flex align-center">
          <span class="svg-container">
            <i class="el-icon-user-solid fs16" />
          </span>
          <el-input
            v-model="registerForm.name"
            placeholder="请填写您的姓名"
            type="text"
          />
        </div>
      </el-form-item>
      <el-form-item prop="phone" verify phone>
        <div class="flex align-center">
          <span class="svg-container">
            <i class="el-icon-phone fs16" />
          </span>
          <el-input
            ref="username"
            v-model="registerForm.phone"
            placeholder="填写要注册的手机号"
            name="username"
            type="text"
            tabindex="1"
          />
          <el-button v-if="!timer" :loading="smsLoading" @click="getSmsImage">获取验证码</el-button>
          <el-button v-else>{{ count }}s后重新获取</el-button>
        </div>
      </el-form-item>
      <el-form-item prop="password" verify>
        <div class="flex align-center">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="password"
            v-model="registerForm.password"
            type="password"
            placeholder="填写要注册的密码"
            @keyup.enter.native="handleLogin"
          />
        </div>
      </el-form-item>
      <el-form-item prop="sms_code" verify>
        <div class="flex align-center">
          <span class="svg-container">
            <i class="el-icon-s-promotion fs16" />
          </span>
          <el-input
            v-model="registerForm.sms_code"
            placeholder="填写验证码"
          />
        </div>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleRegister">注册</el-button>
      <div class="tips">
        <el-button type="text" style="margin-right:20px;" @click="$router.push({ path: '/login' })">已有账号? 立即登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getOrgs, getSms, getSmsImage, getTreeOrgs, register } from '@/api/user'

export default {
  name: 'Login',
  data() {
    return {
      logo: require('@/assets/logo.png'),
      // 机构数据
      orgs: [],
      // 验证码相关
      TIME_COUNT: 60,
      count: 60,
      timer: null,
      sms_image: '',
      smsLoading: false,

      loading: false,
      // 注册表单
      registerForm: {
        org_pid: [],
        phone: '',
        password: '',
        sms_code: '',
        org_name: '',
        name: ''
      }
    }
  },
  mounted() {
    getTreeOrgs().then(res => {
      this.orgs = res.list
    })
  },
  methods: {
    handleChange() {},
    resetData() {},
    // 点击获取验证码
    async getSmsImage() {
      const resPhone = /^(?=\d{11}$)^1(?:3\d|4[57]|5[^4\D]|6[67]|7[^249\D]|8\d|9[189])\d{8}$/
      try {
        if (this.registerForm.phone === '' || !resPhone.test(this.registerForm.phone)) {
          return this.$message({
            message: '手机号格式不正确',
            type: 'warning'
          })
        }
        this.getImage()
      } catch (e) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    // 获取图形验证码
    async getImage() {
      this.smsLoading = true
      this.sms_image = await getSmsImage({
        phone: this.registerForm.phone,
        type: 1
      }).finally(() => {
        this.smsLoading = false
      })
      const h = this.$createElement
      const vnode = h('div', {}, [
        h('p', {}, '请输入图形验证码'),
        h('el-image', {
          attrs: {
            src: this.sms_image
          }
        })
      ])
      this.$prompt(vnode, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\d+/,
        inputErrorMessage: '验证码不能为空'
      }).then(({ value }) => {
        this.getSms(value)
      }).catch(() => {
        clearInterval(this.timer)
        this.timer = null
        this.smsLoading = false
      })
    },

    // 开始获取短信验证码
    async getSms(imgCode) {
      try {
        if (!this.timer) {
          this.smsLoading = true
          this.count = this.TIME_COUNT
          await getSms({
            phone: this.registerForm.phone,
            type: 1,
            img_code: imgCode
          }).finally(() => {
            this.smsLoading = false
          })
          clearInterval(this.timer)
          this.timer = setInterval(() => {
            if (this.count > 0 && this.count <= this.TIME_COUNT) {
              this.count--
            } else {
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        }
      } catch (e) {
        clearInterval(this.timer)
        this.timer = null
        this.smsLoading = false
      }
    },

    // 开始注册
    async handleRegister() {
      await this.$refs.registerForm.validate()
      this.loading = true
      const data = this.registerForm
      this.registerForm.org_pid = data.org_pid[data.org_pid.length - 1]
      await register(this.registerForm).finally(() => {
        this.loading = false
      })
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      height: 47px;
    }
  }

  .sms_code_input {
    width: auto;
  }

  .el-form-item {
    border-radius: 5px;
    border: 1px solid #20a0ff;
  }

  .org-select {
    display: inline-block;
    width: 100%;
  }
}
</style>

<style lang="scss" scoped>

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 120px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    .title {
      padding: 10px 0;
      border-radius: 5px;
      font-size: 26px;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
  }
}
</style>
