<template>
    <div class="update-detial">
        <h1 class="update-title">flychat更新日志</h1>
        <dl class="updte-list" v-for="item in result" :key="item.bh">
            <dt class="update-version">版本{{ item.bbh }}</dt>
            <dd class="update-time">更新{{ item.gxsj }}</dd>
            <dd class="update-item" v-for="(item1, index) in item.gxnr" :key="index">{{item1}}</dd>
        </dl>
    </div>
</template>
<script>
export default {
  name: "updateDetial",
  data () {
    return {
        result: []
    };
  },
  created () {
    this.$ect.ipcRenderer.on('receiveUpdateDetail', (event, arg) => {
        var result = JSON.parse(arg.return);
        result.sort((a, b) => {
            if (a.bbh > b.bbh) {
                return -1;
            } else if (a.bbh < b.bbh){
                return 1;
            }
            return 0;
        });
        for (var i = 0; i < result.length; i++) {
            result[i].gxnr = result[i].gxnr.split('\n');
            this.result.push(result[i]);
        }
    });
  }
}
</script>
<style lang="css" scoped>
    .update-detial {
        padding: 0 20px;
        font-family: -apple-system,SF UI Text,Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,sans-serif;
        font-size: 14px;
        color: black;
    }
    .update-title {
        height: 60px;
        padding: 0px;
        margin: 0px;
        font-size: 30px;
        color: #1cbfa6;
        text-align: center;
        line-height: 60px;
    }
    .update-detial dl, .update-detial dt, .update-detial dd {
        padding: 0px;
        margin: 0px;
    }
    .update-detial .update-version {
        font-size: 20px;
        line-height: 26px;
        font-weight: bold;
    }
    .update-detial .update-time {
        color: #d0d0d0;
        font-style: italic;
    }
    .update-detial dl {
        padding: 0px 0px 30px 0px;
        margin: 0px;
        line-height: 30px;
        list-style: none;
    }
</style>