<template>
  <el-form>
    <el-form-item label="所属工会">{{ rank_info.ranks_org_name }}</el-form-item>
    <el-form-item label="队伍名称">{{ rank_info.ranks_name }}</el-form-item>
    <el-form-item label="参数人员">
      <div class="flex align-center flex-row is-justify-space-between person">
        <div v-for="item in rank_users" :key="item.id" :span="4" class="mr30">
          <el-avatar shape="square" :size="60" :src="item.avatar || `https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png`"></el-avatar>
          <p><span>姓名：{{ item.user_name }}</span></p>
          <p><span>手机号：{{ item.user_phone }}</span></p>
          <p><span>身份证号：{{ item.user_idcard }}</span></p>
        </div>
      </div>
    </el-form-item>
    <el-form-item v-if="![3,4].includes(rank_info.pro_type)">
      <div class="video-wrap">作品展示</div>
      <video-player
        v-if="rank_info.ranks_video_thumb"
        ref="videoPlayer"
        class="video-player vjs-custom-skin"
        :playsinline="true"
        :options="playerOptions"
      />
      <div v-else>暂未上传作品</div>
    </el-form-item>
    <el-button v-if="userInfo.type !== 2 && $route.query.status !== 1" type="primary" @click="handlerPass">通过</el-button>
  </el-form>
</template>

<script>
import { chstatusPass, getBroadCastList, getProductEdit } from '@/api/user'

export default {
  name: 'RankDetails',
  data() {
    return {
      broadcastList: [],
      rank_info: {},
      rank_users: [],
      playerOptions: {
        playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
        autoplay: false, // 如果true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: '', // 这里的种类支持很多种：基本视频格式、直播、流媒体等，具体可以参看git网址项目
          src: '' // url地址
        }],
        poster: '', // 你的封面地址
        // width: document.documentElement.clientWidth, //播放器宽度
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true // 全屏按钮
        }
      }
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
    this.$route.query.id && this.getProductEdit()
  },
  methods: {
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
            await chstatusPass({ status: 1, rank_id: this.$route.query.id }).finally(() => {
              instance.confirmButtonLoading = false
            })
            this.$router.push({ name: 'Dashboard', query: { page: this.$route.query.page }})
            instance.confirmButtonLoading = false
            done()
          } else {
            done()
          }
        }
      })
    },
    // 获取详情
    getProductEdit() {
      getProductEdit({ rank_id: this.$route.query.id }).then(res => {
        this.rank_info = res.rank_info
        this.rank_users = res.rank_users
        this.playerOptions.poster = res.rank_info.ranks_video_thumb
        this.playerOptions.sources.push({
          type: '',
          src: res.rank_info.ranks_video
        })
      })
    }
  }
}
</script>

<style scoped>
.person{
  flex-wrap: wrap;
}
.video-player{
  width: 800px;
  height: 400px;
}
</style>
