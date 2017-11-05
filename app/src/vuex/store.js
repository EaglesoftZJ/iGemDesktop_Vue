import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // 配置
        config: {},
        canUpdate: false
    },
    mutations: {
        init: state => {
            state.config = {};
        },
        setUpdate: state => {
            state.canUpdate = true;
        }
    },
})
