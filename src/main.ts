import Vue from "vue";
import App from "@/App.vue";
// import { createApp } from "vue-demi";
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { createRouter } from "./router";
import { useGlobalRender } from "@jrender-legacy/core";
import JRenderExtends from "@jrender-legacy/extends";
import { DevExtends } from "./components";

import "virtual:windi.css";

// Vue.config.productionTip = false;
// Vue.config.devtools = true;

Vue.use(Element);

useGlobalRender(JRenderExtends);
useGlobalRender(DevExtends);

// const app = createApp(App, {
//   router: createRouter(),
// });

// app.use(Element);

// app.mount("#app");

new Vue({
  router: createRouter(),
  render: (h) => h(App),
}).$mount("#app");
