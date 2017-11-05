<style scoped>
.main {
  width: 100%;
  height: 100%;
}

.title {
  display: flex;
  justify-content: center;
  color: rgb(102, 177, 255);
}

.button {
  margin-top: 10px;
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
    <div class="title">检测到新版本，是否更新</div>
    <div class="button">
      <el-button type="primary" @click="confirmUpdate">确认升级</el-button>
      <el-button type="danger" @click="cancelUpdate">取消</el-button>
    </div>
  </div>
  
  <div class="progress" v-else-if="updateStatus == 1">
    <el-progress  :text-inside="true" :stroke-width="18" :percentage="updateProgress" ></el-progress>
  </div>

  <div class="main" v-else-if="updateStatus == 2">
    <div class="title">点击确定，将关闭程序并开始更新</div>
    <div class="button">
      <el-button type="primary" @click="quitAndInstall">确认</el-button>
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
      updateProgress: 0
    };
  },
  components: {},

  beforeCreate() {
    this.$ect.ipcRenderer.on("start-to-update", (event, arg) => {
      this.updateStatus = 1;
    });

    this.$ect.ipcRenderer.on("update-progress", (event, arg) => {
      this.updateProgress = arg;
      if (arg >= 100) {
        this.updateStatus = 2;
      }
    });
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
      this.$ect.ipcRenderer.send('quitAndInstall');
    }
  },

  name: "update"
};
</script>
