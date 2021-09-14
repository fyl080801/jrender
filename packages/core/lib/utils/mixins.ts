import { getCurrentInstance, inject, provide } from "@vue/composition-api";
import { createServiceProvider } from "./service";

const serviceToken = Symbol("serviceToken");

const setupToken = Symbol("setupToken");

export const useJRender = (props?: Record<string, unknown>) => {
  if (props) {
    const { context, slots, mergedServices } = props;

    provide(serviceToken, { context, slots, mergedServices });

    return props;
  } else {
    return inject(serviceToken);
  }
};

export const useRootRender = (setup?: unknown) => {
  const provider = createServiceProvider();

  if (setup) {
    provider.setup(setup);
    provide(setupToken, provider.getServices());
  } else {
    return inject(setupToken, provider.getServices());
  }
};

export const useVueHelper = () => {
  const instance = getCurrentInstance();
  const VNodeType: any = instance?.proxy.$createElement("span", "").constructor;

  return {
    isVNode: (node: any) => {
      return node instanceof VNodeType;
    },
  };
};
