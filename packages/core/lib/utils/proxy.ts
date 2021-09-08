import { isArray, isDom, isFunction, isObject } from "./helper";

const ISPROXY = "__j_proxy";

export const isInjectedProxy = (target: Record<string, unknown>) => {
  return target[ISPROXY];
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
