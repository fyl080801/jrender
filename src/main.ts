import Vue from "vue";
import App from "@/App.vue";
import { createApp, h } from "vue-demi";

import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { createRouter } from "./router";

import { useGlobalRender } from "@jrender/core";
import JRenderExtends from "@jrender/extends";

Vue.config.productionTip = false;
Vue.config.devtools = true;

useGlobalRender(JRenderExtends);

const app = createApp({
  router: createRouter(),
  render: () => h(App),
});

app.use(Element);

app.mount("#app");
