import { deepClone } from "@jrender/core";
import { reactive, shallowReadonly } from "@vue/composition-api";

export const createState = (init: any) => {
  return reactive(deepClone(init));
};

export const store = (init: any, factory: any) => {
  const state = createState(init);

  const actions: Record<string, unknown> = {};

  Object.keys(factory).forEach((key) => {
    actions[key] = factory[key](state, actions);
  });

  return () => shallowReadonly({ state, ...actions });
};
