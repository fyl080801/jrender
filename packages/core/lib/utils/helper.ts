export const isArray = (target: unknown) => {
  return Array.isArray(target);
};

export const isObject = (target: unknown) => {
  return (
    target !== undefined &&
    target !== null &&
    typeof target === "object" &&
    Object.prototype.toString.call(target) === "[object Object]" &&
    !isArray(target)
  );
};

export const isFunction = (target: unknown) => {
  return typeof target === "function";
};

export const isNumberLike = (value: unknown) => {
  return String(value).match(/^\d+$/);
};

export const isDom = (target: unknown) => {
  const expr =
    typeof HTMLElement === "object"
      ? function () {
          return target instanceof HTMLElement;
        }
      : function () {
          return (
            target &&
            typeof target === "object" &&
            (target as HTMLElement).nodeType === 1 &&
            typeof (target as HTMLElement).nodeName === "string"
          );
        };

  return expr();
};

export const assignArray = (...targets: any) => {
  return targets.reduce((pre: any, cur: any) => {
    return (pre as unknown[]).concat(cur);
  }, []);
};

export const assignObject = (...targets: Record<string, unknown>[]) => {
  return Object.assign({}, ...targets);
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
              (target as Record<string, unknown>)[i],
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

export const toPath = (pathString: string) => {
  if (isArray(pathString)) {
    return pathString;
  }
  if (typeof pathString === "number") {
    return [pathString];
  }
  pathString = String(pathString);

  // lodash 的实现 - https://github.com/lodash/lodash
  const pathRx =
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
  const pathArray: unknown[] = [];

  const replacer = (match: any, num: any, quote: any, str: any) => {
    pathArray.push(quote ? str : num !== undefined ? Number(num) : match);
    return pathArray[pathArray.length - 1];
  };

  pathString.replace(pathRx, replacer as any);

  return pathArray;
};

export const hasOwnProperty = (target: Record<string, unknown>, prop: string) => {
  return Object.prototype.hasOwnProperty.call(target, prop);
};

export const deepSet = (target: Record<string, unknown>, path: string, value: unknown) => {
  const fields = isArray(path) ? path : toPath(path);
  const prop = (fields as any).shift();

  if (!fields.length) {
    return (target[prop] = value);
  }

  if (!hasOwnProperty(target, prop) || target[prop] === null) {
    // 当前下标是数字则认定是数组
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
    target[prop] = objVal;
  }

  deepSet((target as any)[prop], fields as any, value);
};

export const deepGet = (target: Record<string, unknown>, path: string) => {
  const fields = isArray(path) ? path : toPath(path);

  if (!fields.length) {
    return target;
  }

  let prop = (fields as any).shift();
  let result: any = target;

  while (prop) {
    result = result[prop];

    if (fields.length > 0 && (result === undefined || result === null)) {
      result = isNumberLike(prop) ? [] : {};
    }

    prop = (fields as any).shift();
  }

  return result;
};
