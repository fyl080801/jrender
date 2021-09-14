import { assignArray, assignObject, isArray, isFunction, isObject } from "./helper";
import { rawdata, getvalue, compute, assign, GET, SET } from "./inner";

export const createServiceProvider = () => {
  const services = {
    components: {},
    functional: {},
    beforeRenderHandlers: [],
    renderHandlers: [],
    proxy: [],
    dataSource: {},
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
    onRender: (handler: (field: unknown) => unknown) => {
      if (isFunction(handler)) {
        (services.renderHandlers as unknown[]).push(handler);
      }
    },
    addProxy: (handler: unknown) => {
      if (isFunction(handler)) {
        (services.proxy as unknown[]).push(handler);
      }
    },
    addDataSource(type: string, provider: unknown) {
      if (type && isFunction(provider)) {
        (services.dataSource as Record<string, unknown>)[type] = provider;
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

export const mergeServices = (...services: any[]) => {
  const merged: any = {
    functional: { SET, GET },
    proxy: [getvalue, compute, assign],
    renderHandlers: [],
    dataSource: {
      default: rawdata,
    },
  };

  services.forEach((service) => {
    Object.keys(service || {}).forEach((key) => {
      if (isObject(service[key])) {
        merged[key] ||= {};
        merged[key] = assignObject(merged[key], service[key]);
      } else if (isArray(service[key])) {
        merged[key] ||= [];
        merged[key] = assignArray(merged[key], service[key]);
      }
    });
  });

  return merged;
};

export const globalServiceProvider = createServiceProvider();

export const useGlobalRender = (setting: any) => {
  globalServiceProvider.setup(setting);
};
