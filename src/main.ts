import Vue from "vue";
import App from "@/App.vue";
import Element from "element-ui";
import VueCompositionAPI from "@vue/composition-api";
import "element-ui/lib/theme-chalk/index.css";
import { createRouter } from "./router";
import { useGlobalRender } from "@jrender-legacy/core";
import JRenderExtends from "@jrender-legacy/extends";
import { DevExtends } from "./components";

import "virtual:windi.css";

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(VueCompositionAPI);
Vue.use(Element);

useGlobalRender(JRenderExtends);
useGlobalRender(DevExtends);

new Vue({
  router: createRouter(),
  render: (h) => h(App),
}).$mount("#app");
