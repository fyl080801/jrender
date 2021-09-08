import { isFunction } from "./helper";

export const createServiceProvider = () => {
  const services = {
    components: {},
    functional: {},
    beforeRenderHandlers: [],
    proxy: [],
  };

  const setting = {
    addComponent: (name: string, type: unknown) => {
      (services.components as Record<string, unknown>)[name] = type;
    },
    addFunction: (name: string, fx: unknown) => {
      if (isFunction(fx)) {
        (services.functional as Record<string, unknown>)[name] = fx;
      }
    },
    onBeforeRender: (handler: (field: unknown) => unknown) => {
      if (isFunction(handler)) {
        (services.beforeRenderHandlers as unknown[]).push(handler);
      }
    },
    addProxy: (handler: unknown) => {
      if (isFunction(handler)) {
        (services.proxy as unknown[]).push(handler);
      }
    },
  };

  const instance = {
    setup: (doSetup: any) => {
      doSetup(setting);
      return instance;
    },
    getSetting() {
      return setting;
    },
    getServices() {
      return services;
    },
  };

  return instance;
};
