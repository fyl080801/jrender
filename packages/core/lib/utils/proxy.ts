import { assignObject } from "./helper";
import { isArray, isDom, isFunction, isObject } from "./helper";

const PROXY = "__j_proxy";
const RAW = "__j_raw";

export const isInjectedProxy = (target) => {
  return target !== undefined && target !== null && target[PROXY];
};

export const getProxyDefine = (target) => {
  return isInjectedProxy(target) ? target[RAW] : target;
};

export const injectProxy = ({ context, scope, proxy }) => {
  const handlers = [...proxy];

  const inject = (input) => {
    if (!isObject(input) && !isArray(input)) {
      return input;
    }

    if (isInjectedProxy(input)) {
      return input;
    }

    const injectObject = isObject(input) ? {} : [];

    Object.defineProperty(injectObject, PROXY, {
      get() {
        return true;
      },
      enumerable: false,
    });

    Object.defineProperty(injectObject, RAW, {
      get() {
        return input;
      },
      enumerable: false,
    });

    Object.keys(input).forEach((key) => {
      Object.defineProperty(injectObject, key, {
        get() {
          const value = input[key];

          for (const f of handlers) {
            const handler = f(value);

            if (handler && isFunction(handler)) {
              return inject(handler(assignObject(context, scope || {})));
            }
          }

          return (isDom(value) && value) || inject(value);
        },
        set(value) {
          input[key] = value;
        },
        enumerable: true,
        configurable: true,
      });
    });

    return injectObject;
  };

  return inject;
};
