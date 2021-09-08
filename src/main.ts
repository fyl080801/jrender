import Vue from "vue";
import App from "@/App.vue";
import { createApp, defineComponent } from "vue-demi";

import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
// import "windi.css";

Vue.config.productionTip = false;
Vue.config.devtools = true;

const app = createApp(App);

app.use(Element);

app.mount("#app");
