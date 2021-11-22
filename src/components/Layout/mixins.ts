import { provide } from "@vue/composition-api";

export const layoutToken = Symbol("layoutToken");

export const useContainer = (props) => {
  provide(layoutToken, props);
};
