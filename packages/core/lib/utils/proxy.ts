import { isArray, isFunction, isObject } from "./helper";

const ISPROXY = "__j_proxy";

export const isInjectedProxy = (target: Record<string, unknown>) => {
  return target[ISPROXY];
};

export const injectProxy = ({ context = {}, functional = {}, proxy = [] }) => {
  const compute = (value: string) => {
    const handler = (context: Record<string, unknown>) => {
      try {
        const keys = Object.keys(context);
        const funcKeys = Object.keys(functional);
        return new Function(...[...keys, ...funcKeys], `return ${value.replace("$:", "")}`)(
          ...[
            ...keys.map((key) => context[key]),
            ...funcKeys.map((key) => (functional as Record<string, unknown>)[key]),
          ],
        );
      } catch {
        //
      }
    };

    return typeof value === "string" && value.startsWith("$:") && handler;
  };

  const handlers = [compute, ...proxy];

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

        return inject(value);
      },
    });
  };

  return inject;
};
