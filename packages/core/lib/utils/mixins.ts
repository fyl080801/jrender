import { inject, provide } from "vue-demi";
import { createServiceProvider } from "./service";

const serviceToken = Symbol("serviceToken");

const setupToken = Symbol("setupToken");

export const useJRender = (props?: Record<string, unknown>) => {
  if (props) {
    const services = Object.keys(props).reduce((target, key) => {
      target[key] = props[key];
      return target;
    }, {} as Record<string, unknown>);

    provide(serviceToken, services);

    return services;
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
