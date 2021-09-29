<template>
  <div class="login-container">
    <!--  登录  -->
    <el-form v-if="is_login" ref="loginForm" :model="loginForm" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>
      <el-form-item prop="username" verify>
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="账号"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="password" verify>
        <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
        </span>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

      <div class="tips">
        <el-button type="text" style="margin-right:20px;" @click="is_login = !is_login">没有账号? 立即注册</el-button>
      </div>

    </el-form>
    <!--  注册  -->
    <el-form v-else ref="registerForm" :model="registerForm" class="login-form" auto-complete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">注册</h3>
      </div>
      <el-form-item prop="org_pid" verify class="flex align-center">
        <el-select v-model="registerForm.org_pid" class="org-select" placeholder="请选择要注册的机构">
          <el-option
            v-for="item in orgs"
            :key="item.id"
            :label="item.org_name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="phone" verify phone>
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
        <el-input
          ref="username"
          v-model="registerForm.phone"
          placeholder="填写要注册的手机号"
          name="username"
          type="text"
          tabindex="1"
        />
      </el-form-item>
      <el-form-item prop="password" verify>
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="填写要注册的密码"
          name="password"
          tabindex="2"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item prop="sms_code" verify>
        <div class="flex align-center justify-between">
          <div>
            <span class="svg-container">
              <i class="el-icon-message fs16" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="registerForm.password"
              :type="passwordType"
              placeholder="填写要注册的密码"
              name="password"
              class="sms_code_input flex-1"
              tabindex="2"
              @keyup.enter.native="handleLogin"
            />
          </div>
          <el-button>获取验证码</el-button>
        </div>
      </el-form-item>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">注册</el-button>
      <div class="tips">
        <el-button type="text" style="margin-right:20px;" @click="is_login = !is_login">已有账号? 立即登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getOrgs } from '@/api/user'

export default {
  name: 'Login',
  data() {
    return {
      // 机构数据
      orgs: [],
      // 登录还是注册
      is_login: false,
      registerForm: {
        org_pid: '',
        phone: '',
        password: '',
        sms_code: '',
        org_name: ''
      },
      loginForm: {
        username: 'admin',
        password: '111111'
      },
      loading: false,
      passwordType: 'password',
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
  mounted() {
    getOrgs().then(res => {
      console.log(res)
      this.orgs = res.list
    })
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
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
