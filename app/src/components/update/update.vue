<style scoped>
.main {
  width: 100%;
  height: 100%;
}

.title {
  padding-top:15px;
  display: flex;
  justify-content: center;
  color: rgb(102, 177, 255);
  font-size: 16px;
}
.message {
  display: flex;
  justify-content: center;
  font-size: 13px;
  padding-top: 10px;
}
.button {
  padding-top: 15px;
  display: flex;
  justify-content: space-around;
}
.progress {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 30px;
}
</style>

<template>
  <div class="main" v-if="updateStatus == 0">
    <div class="title">Flychat客户端升级</div>
    <div class="message">检测到新版本<a style="color: #2196f3" href="javascript:;" @click="openUpdateDetial">(查看更新内容)</a>，是否更新</div>
    <div class="button">
        <el-button type="primary" @click="confirmUpdate">确认升级</el-button>
        <el-button type="danger" @click="cancelUpdate">取消</el-button>
    </div>
  </div>
  
  <div class="progress" v-else-if="updateStatus == 1">
    <el-progress  :text-inside="true" :stroke-width="18" :percentage="updateProgress" ></el-progress>
    <div class="message">正在下载文件，请稍候</div>
  </div>

  <div class="main" v-else-if="updateStatus == 2">
    <div class="title">下载完成</div>
    <div class="message">点击确定，将关闭程序并开始更新</div>
    <div class="button">
      <el-button type="primary" @click="quitAndInstall" :disabled="startInstall">确认</el-button>
    </div>
  </div>
  
</template>

<script>
import Vue from "vue";
import electron from "electron";

export default {
  data() {
    return {
      updateStatus: 0, // 0 未开始  1  开始下载  2  下载完成
      updateProgress: 0,
      startInstall: false
    };
  },
  components: {},

  beforeCreate() {
    this.$ect.ipcRenderer.on("start-to-update", (event, arg) => {
      this.updateStatus = 1;
    });

    this.$ect.ipcRenderer.on("update-progress", (event, arg) => {
      this.updateProgress = Math.round(arg) 
      if (arg >= 100) {
        this.updateStatus = 2;
      }
    });

    this.$ect.ipcRenderer.send("update-created", true);
  },

  mounted() {},

  methods: {
    confirmUpdate() {
      electron.ipcRenderer.send("confirm-update", true);
    },
    cancelUpdate() {
      electron.ipcRenderer.send("confirm-update", false);
    },
    quitAndInstall() {
      this.startInstall = true;
      this.$ect.ipcRenderer.send('quitAndInstall');
    },
    openUpdateDetial() {
        // 打开日志更新窗口
        electron.ipcRenderer.send("showUpdateDetial");
    }
  },

  name: "update"
};
</script>
