import { isArray, isDom, isFunction, isObject } from "./helper";

const ISPROXY = "__j_proxy";
const RAW = "__j_raw";

export const isInjectedProxy = (target: Record<string, unknown>) => {
  return target[ISPROXY];
};

export const getProxyRaw = (target: Record<string, unknown>) => {
  return isInjectedProxy(target) ? target[RAW] : target;
};

export const injectProxy = (services: Record<string, any>) => {
  const { context = {}, proxy = [] } = services;

  const handlers = [...proxy];

  const inject = (input: Record<string, unknown>): unknown => {
    if (!isObject(input) && !isArray(input)) {
      return input;
    }

    if (isInjectedProxy(input)) {
      return input;
    }

    return new Proxy(input, {
      get: (target, p, receiver) => {
        if (p === ISPROXY) {
          return true;
        }

        if (p === RAW) {
          debugger;
          return target;
        }

        const value = Reflect.get(target, p, receiver);

        for (const f of handlers) {
          const handler = f(value);

          if (handler && isFunction(handler)) {
            return inject(handler(context));
          }
        }

        return (!isDom(value) && inject(value)) || value;
      },
    });
  };

  return inject;
};
