import { provide } from "vue";

export const layoutToken = Symbol("layoutToken");

export const designerToken = Symbol("designerToken");

export const useContainer = (props) => {
  provide(layoutToken, props);
};
