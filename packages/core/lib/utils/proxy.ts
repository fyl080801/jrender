import { assignObject } from "./helper";
import { isArray, isDom, isFunction, isObject } from "./helper";
import ProxyPolyfill from "es6-proxy-polyfill";

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

    return injectObject;

    // return new ProxyPolyfill(input, {
    //   get: (target, p) => {
    //     if (p === PROXY) {
    //       return true;
    //     }

    //     if (p === RAW) {
    //       return input;
    //     }

    //     const value = target[p];

    //     for (const f of handlers) {
    //       const handler = f(value);

    //       if (handler && isFunction(handler)) {
    //         return inject(getProxyDefine(handler(assignObject(context, scope || {}))));
    //       }
    //     }

    //     return (isDom(value) && value) || inject(getProxyDefine(value));
    //   },
    // });
  };

  return inject;
};
