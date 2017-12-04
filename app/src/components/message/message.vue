<template>
    <div class="message">
        <div class="message-con" ref="con">
        <div class="message-total">新消息 ({{ total }})</div>
        <div class="message-current" v-if="current">
            <div class="message-item" @click ="clickUser(currentDialog)">
                <div class="message-user-pic" :class="!currentAvatar ? 'placeholder--' + currentPlaceholder : ''">
                    <img :src="currentAvatar" width="100%" height="100%" v-if="currentAvatar" /> 
                    <span v-else>{{ getFirstChar(currentName) }}</span>
                </div>
                <div class="message-detail">
                  <div class="message-user-name text-overflow">{{ currentName }}</div>
                  <div class="message-user-info text-overflow" v-html="detialInfo"></div>
                </div>
            </div>
        </div>
          <div class="message-list">
             <transition-group name="message">
              <div class="message-item" v-for="item in data.messages" :key="item.id" @click ="clickUser(item.id)">
                  <div class="message-user-pic" :class="!item.avatar ? 'placeholder--' + item.placeholder : ''">
                      <img :src="item.avatar" width="100%" height="100%" v-if="item.avatar" /> 
                      <span v-else>{{ getFirstChar(item.userName) }}</span>
                  </div>
                  <div class="message-detail">
                    <div class="message-user-name text-overflow">{{ item.userName }}</div>
                  </div>
                  <div class="message-size">{{ item.size }}</div>
              </div>
            </transition-group>
          </div>
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
      currentType: '',
      currentAvatar: '',
      currentPlaceholder: '',
      currentDialog: '',
      currentName: ''
    };
  },

  computed: {
    current() {
      return !!this.data.current.title;
    },         
    total() {
      var len = linq.from(this.data.messages).sum('$.size');
      return len + (this.current ? 1 : 0);
    },
    detialInfo() {
      var info = '';
      if (this.data.current.content == 'text' ) {
        info = this.data.current.text;
      } else if(this.data.current.content == 'document') {
        info = '发送了文件 ' + this.data.current.fileName;
      } else if(this.data.current.content == 'photo' || this.data.current.content == 'animation') {
        info = `<div class="message-current-img" style="background-image: url(${this.data.current.fileUrl})"></div>`;
      }
      if (this.currentType === 'group') {
        info = this.data.current.title + ': ' + info;
      }
      return info;
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
      var arr = linq
        .from(this.data.messages)
        .toArray();
      var height = (this.data.messages.length + (this.data.current.title ? 1 : 0)) * 47 + 36;
      height = height > 177 ? 177 : height;
      this.$ect.ipcRenderer.send("size-change", { width: 260, height: height });
      
    },
    clickUser(id) {
      this.$ect.ipcRenderer.send("notification-click", id);
    }
  },
  updated () {
    this.sizeChange();
  },
  created() {
    this.$ect.ipcRenderer.on("update-messages", (event, arg) => {
      this.data.messages = arg;
    });
    this.$ect.ipcRenderer.on("update-current-messages", (event, arg) => {
      this.$set(this.data, 'current',  arg);
    });
    this.$ect.ipcRenderer.on("update-current-dailog", (event, arg) => {
      for (var key in arg) {
        if (arg.hasOwnProperty(key)) {
          this[key] = arg[key];
        }
      }
    });
  }
};
</script>
<style lang="scss">
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
  height:100%;
  overflow: hidden;
  font-size: 14px;
  font-family: tahoma, arial, "Hiragino Sans GB", "Microsoft YaHei",
    "\5b8b\4f53", sans-serif;
  background: #fff;
}
.message-con {
  max-height: 177px;
  overflow-x: hidden;
  overflow-y: auto;
}
.message-current {
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.message-list {
  width: 260px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.message-item {
  position: relative;
  display: flex;
  height: 36px;
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
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  margin-right: 5px;
  overflow: hidden;
  color: #fff;
  text-align: center;
  line-height: 36px;
  vertical-align: middle;
  border-radius: 100%;
}
.message-detail {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 200px;
  line-height: 1.2;
}
.message-user-name {
  flex: 1;
  font-weight: bold;
}
.message-user-info {
  flex: 1;
  font-size: 12px;
}
.message-current-img {
  display: inline-block;
  width: 100px;
  height: 100%;
  background-size: contain;
  background-position: left center;
  background-repeat: no-repeat;
  vertical-align: text-bottom;
}
.message-list .message-detail {
  line-height: 36px;
}
.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.message-size {
  position: absolute;
  top: 10px;
  right: 20px;
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
.message-total {
  height: 36px;
  line-height: 36px;
  padding: 0 10px;
  box-shadow: 0px 1px 0px 0 #efecec;
}
</style>