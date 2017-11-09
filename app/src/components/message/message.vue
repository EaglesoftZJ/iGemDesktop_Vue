<template>
    <div class="message">
        <div class="message-current">
            <span class="message-current-name" :title="data.current.userName">{{ data.current.userName }}:</span>
            <span class="message-current-detial">{{ data.current.text }}</span>
        </div>
          <div class="message-list">
             <transition-group name="message">
              <div class="message-item" v-for="item in data.messages" :key="item.id" v-if="item.userName != data.current.userName">
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
export default {
  name: 'Message',
  componentName: 'Message',
  data () {
    return {
      data: {
        current: {
          userName: '',
          content: '',
          text: '',
          fileUrl: ''
        },
        messages: [
        ]
      }
    }
  },
  methods: {
    getFirstChar (title) {
      const emojiFirstChar = /([\uE000-\uF8FF]|\uD83C|\uD83D)/g
      if (title.length === 0) {
        return '#'
      }
      return title[0].match(emojiFirstChar) ? '#' : title[0]
    }
  },
  created () {
    // ajax请求
    this.$ect.ipcRenderer.on("update-messages", (event, arg) => {
      this.data.messages = arg;
    });
    this.$ect.ipcRenderer.on("update-current-messages", (event, arg) => {
      this.data.current.userName = arg.userName;
      this.data.current.text = arg.text;
    });
  }
}
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
  font-family: tahoma, arial, 'Hiragino Sans GB','Microsoft YaHei', '\5b8b\4f53',sans-serif;
  background: #fff;
}
.message-current {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  line-height: 40px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.message-current-name {
  font-weight: bold;
}
.message-current-detial {
  margin-right: 5px;
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
.message-enter{
  transform: translate3d(-100%, 0, 0);
}
 .message-leave-active{
  transform: translate3d(100%, 0, 0);
 }
</style>