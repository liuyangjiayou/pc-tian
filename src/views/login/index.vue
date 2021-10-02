<template>
  <div class="login-container">
    <!--  登录  -->
    <el-form ref="loginForm" :model="loginForm" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>
      <el-form-item prop="acc" verify>
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          v-model="loginForm.acc"
          placeholder="账号"
        />
      </el-form-item>
      <el-form-item prop="pwd" verify>
        <span class="svg-container">
          <svg-icon icon-class="pwd" />
        </span>
        <el-input
          v-model="loginForm.pwd"
          type="password"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

      <div class="tips">
        <el-button type="text" style="margin-right:20px;" @click="goRegister">没有账号? 立即注册</el-button>
      </div>

    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录还是注册
      is_login: true,
      // 登录表单
      loginForm: {
        acc: '石家庄市新华区总工会',
        pwd: '123456'
      },
      // 登录loading
      loading: false,
      // 重定向
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    // 去注册页
    goRegister() {
      this.$router.push({ path: '/register' })
    },
    // 开始登录
    async handleLogin() {
      await this.$refs.loginForm.validate()
      this.loading = true
      this.$store.dispatch('user/login', { username: this.loginForm.acc, password: this.loginForm.pwd }).then(() => {
        this.$router.push({ path: this.redirect || '/' })
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
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
    width: 85%;

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
    width: 448px;
    .el-input {
      box-sizing: border-box;
      padding-left: 30px;
      width: 100%;
    }
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
    padding: 160px 35px 0;
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
