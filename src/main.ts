import Vue from "vue";
import App from "@/App.vue";
import { createApp, h } from "vue-demi";

import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { createRouter } from "./router";

import { useGlobalRender } from "@jrender-legacy/core";
import JRenderExtends from "@jrender-legacy/extends";
import { DevExtends } from "./components";

import "virtual:windi.css";

Vue.config.productionTip = false;
Vue.config.devtools = true;

useGlobalRender(JRenderExtends);
useGlobalRender(DevExtends);

const app = createApp({
  router: createRouter(),
  render: () => h(App),
});

app.use(Element);

app.mount("#app");
