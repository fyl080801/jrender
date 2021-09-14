import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export const createRouter = () => {
  return new VueRouter({
    base: "/",
    mode: "history",
    routes: [
      { path: "/simple", name: "simple", component: () => import("@/views/Simple.vue") },
      { path: "/table", name: "table", component: () => import("@/views/Table.vue") },
      { path: "/designer", name: "designer", component: () => import("@/views/Designer.vue") },
      { path: "/", redirect: "/simple" },
    ],
  });
};
