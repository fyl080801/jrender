import Vue from "vue";
import App from "@/App.vue";
import { createApp } from "vue-demi";

import "windi.css";

Vue.config.productionTip = false;
Vue.config.devtools = true;

const app = createApp(App);

app.mount("#app");
