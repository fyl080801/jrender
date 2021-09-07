export const isArray = (target: unknown) => {
  return Array.isArray(target);
};

export const isObject = (target: unknown) => {
  return target !== null && typeof target === "object";
};

export const isFunction = (target: unknown) => {
  return typeof target === "function";
};

export const deepClone = (target: unknown) => {
  if (!target) {
    return target;
  } // null, undefined values check

  const types = [Number, String, Boolean];
  let result;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach((type) => {
    if (target instanceof type) {
      result = type(target);
    }
  });

  if (typeof result == "undefined") {
    if (isArray(target)) {
      result = [];
      (target as unknown[]).forEach((child, index) => {
        result[index] = deepClone(child);
      });
    } else if (isObject(target)) {
      // testing that this is DOM
      if ((target as Node).nodeType && isFunction((target as Node).cloneNode)) {
        result = (target as Node).cloneNode(true);
      } else if (!(target as Record<string, unknown>).prototype) {
        // check that this is a literal
        if (target instanceof Date) {
          result = new Date(target);
        } else {
          // it is an object literal
          result = {};
          for (const i in target as Record<string, unknown>) {
            (result as Record<string, unknown>)[i] = deepClone(
              (target as Record<string, unknown>)[i]
            );
          }
        }
      } else {
        // depending what you would like here,
        // just keep the reference, or create new object
        if ((target as Record<string, unknown>).constructor) {
          // would not advice to do that, reason? Read below
          result = new (target as any).constructor();
        } else {
          result = target;
        }
      }
    } else {
      result = target;
    }
  }

  return result;
};
