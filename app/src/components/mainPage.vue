<style scoped>
.main {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="main">
      <Update v-if="canUpdate"></Update>
  </div>
</template>

<script>
import Vue from "vue";
import Store from "../vuex/store";
import Update from "./update/update.vue";

export default {
  components: {
    Update
  },
  data() {
    return {};
  },
  computed: {
    canUpdate: function() {
      return Store.state.canUpdate;
    }
  },

  beforeCreate() {
    global.Vue = Vue;
    global.Store = Store;
    this.$ect.ipcRenderer.send("page-created", true);
    this.$ect.ipcRenderer.on('change-to-update', (event, arg) => {
      Store.commit('setUpdate');
    });
  },

  name: "MainPage"
};
</script>
