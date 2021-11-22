import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export const createRouter = () => {
  return new VueRouter({
    base: "/",
    mode: "history",
    routes: [
      { path: "/simple", name: "simple", component: () => import("@/views/Simple.vue") },
      { path: "/nest", name: "nest", component: () => import("@/views/Nest.vue") },
      { path: "/layout", name: "layout", component: () => import("@/views/Layouted.vue") },
      { path: "/", redirect: "/simple" },
    ],
  });
};
