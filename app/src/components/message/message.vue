<template>
    <div class="message">
        <div class="message-current" @click="clickUser(currentDialog)" v-if="current">
            <div class="message-current-group" v-if="currentGroupName" :title="currentGroupName">群组<span>{{ currentGroupName }}</span>中</div>
            <span :class="['message-current-name', 'group']" :title="data.current.title">{{ data.current.title }}</span>
            <span v-if="data.current.content == 'text' || data.current.content == 'document'" class="message-current-detial">{{ data.current.text ? ': ' + data.current.text : '发送了文件 ' + data.current.fileName }}</span>
            <div v-if="data.current.content == 'photo' || data.current.content == 'animation'" class="message-current-img" :style="{'background-image': 'url(' + data.current.fileUrl + ')'}"></div>
        </div>
          <div class="message-list">
             <transition-group name="message">
              <div class="message-item" v-for="item in data.messages" :key="item.id" @click ="clickUser(item.id)">
                  <div class="message-user-pic" :class="!item.avatar ? 'placeholder--' + item.placeholder : ''">
                      <img :src="item.avatar" width="100%" height="100%" v-if="item.avatar" /> 
                      <span v-else>{{ getFirstChar(item.userName) }}</span>
                  </div>
                  <span class="message-user-name">{{ item.userName }}</span>
                  <div class="message-size">{{ item.size }}</div>
              </div>
            </transition-group>
          </div>
    </div>
</template>
<script>
import linq from "linq";
export default {
  name: "Message",
  componentName: "Message",
  data() {
    return {
      data: {
        current: {
          id: "",
          title: "",
          content: "",
          text: "",
          fileUrl: "",
          fileName: ""
        },
        messages: []
      },
      currentDialog: '',
      currentGroupName: ''
    };
  },

  computed: {
    current() {
      return !!this.data.current.title;
    }
  },
  methods: {
    getFirstChar(title) {
      const emojiFirstChar = /([\uE000-\uF8FF]|\uD83C|\uD83D)/g;
      if (title.length === 0) {
        return "#";
      }
      return title[0].match(emojiFirstChar) ? "#" : title[0];
    },
    sizeChange() {
      var top = this.current ? this.currentGroupName ? 60 : 30 : 0;
      var arr = linq
        .from(this.data.messages)
        // .where('$.sender !=="' + this.currentDialog + '"')
        .toArray();
      var height = (arr.length >= 3 ? 123 : arr.length * 41) + top;
      this.$ect.ipcRenderer.send("size-change", { width: 260, height: height });
    },
    clickUser(id) {
      this.$ect.ipcRenderer.send("notification-click", id);
    }
  },
  created() {
    this.$ect.ipcRenderer.on("update-messages", (event, arg) => {
      this.data.messages = arg;
      this.sizeChange();
    });
    this.$ect.ipcRenderer.on("update-current-messages", (event, arg) => {
      console.log(11111111111, arg);
      this.$set(this.data, 'current',  arg);
      // this.data.current.titlee = arg.userName;
      // this.data.current.text = arg.text;
      // this.data.current.id = arg.id;
      this.sizeChange();
    });
    this.$ect.ipcRenderer.on("update-current-dailog", (event, arg) => {
      // 用于记录当前对话框的类型，如果是群组记录群组名称，用于展示以不同形式展示不同类型的当前聊天内容
      this.currentDialog = arg.currentDialog;
      this.currentGroupName = arg.currentGroupName;
    });
  }
};
</script>
<style lang="scss" scoped>
$color-empty: #b8b8b8;
$color-lblue: #59a2be;
$color-blue: #2093cd;
$color-purple: #ad62a7;
$color-red: #f16364;
$color-orange: #f9a43e;
$color-yellow: #e4c62e;
$color-pink: #ed608b;
$color-green: #67bf74;
.message {
  width: 260px;
  font-size: 14px;
  font-family: tahoma, arial, "Hiragino Sans GB", "Microsoft YaHei",
    "\5b8b\4f53", sans-serif;
  background: #fff;
}
.message-current {
  width: 100%;
  min-height: 30px;
  padding: 0 10px;
  line-height: 30px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.message-current-group {
  height: 30px;
  font-size: 16px;
  line-height: 40px;
}
.message-current-group span {
  font-weight: bold;
}
.message-current-name {
  font-weight: bold;
}
.message-current-name.group {
  font-weight: normal;
}
.message-current-detial {
  margin-right: 5px;
}
.message-current-img {
  display: inline-block;
  width: 100px;
  height: 26px;
  vertical-align: text-bottom;
  background-position: left top;
  background-repeat: no-repeat;
  background-size: contain;
}
.message-detial {
  display: inline-block;
}
.message-list {
  width: 260px;
  max-height: 123px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.message-item {
  position: relative;
  height: 30px;
  padding: 5px 10px;
  overflow: hidden;
  border-top: 1px solid #e3e8ee;
  box-sizing: content-box;
  cursor: pointer;
  transition: all 0.3s ease-in;
}
.message-item:hover {
  background: #e3e8ee;
}
.message-item:not(:first-child) {
  border-top: 1px dashed #e3e8ee;
}
.message-user-pic {
  display: inline-block;
  width: 30px;
  height: 30px;
  overflow: hidden;
  color: #fff;
  text-align: center;
  line-height: 30px;
  vertical-align: middle;
  border-radius: 100%;
}
.message-user-name {
  vertical-align: middle;
}
.placeholder {
  &--empty {
    background-color: $color-empty;
  }
  &--lblue {
    background-color: $color-lblue;
  }
  &--blue {
    background-color: $color-blue;
  }
  &--purple {
    background-color: $color-purple;
  }

  &--red {
    background-color: $color-red;
  }

  &--orange {
    background-color: $color-orange;
  }

  &--yellow {
    background-color: $color-pink;
  }

  &--green {
    background-color: $color-green;
  }
}
.message-user-name {
  display: inline-block;
  width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.message-size {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 12px;
  height: 12px;
  padding: 4px;
  text-align: center;
  color: #fff;
  line-height: 12px;
  border-radius: 12px;
  background: red;
  box-sizing: content-box;
}
.message-enter {
  transform: translate3d(-100%, 0, 0);
}
.message-leave-active {
  transform: translate3d(100%, 0, 0);
}
</style>