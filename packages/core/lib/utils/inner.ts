import { deepGet, hasOwnProperty, isArray, isNumberLike, toPath } from "./helper";
import { set } from "vue-demi";

export const compute =
  ({ functional }: Record<string, unknown>) =>
  (value: string) => {
    const handler = (context: Record<string, unknown>) => {
      try {
        const keys = Object.keys(context);
        const funcKeys = Object.keys(functional as Record<string, unknown>);
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

export const UPDATE = (target: Record<string, unknown>, path: string, value: unknown) => {
  const fields = isArray(path) ? path : toPath(path);
  const prop = (fields as any).shift();

  if (!fields.length) {
    return set(target, prop, value);
  }

  if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
    set(target, prop, objVal);
  }

  UPDATE((target as any)[prop], fields as any, value);
};

export const GET = (target: Record<string, unknown>, path: string, def: unknown) => {
  return deepGet(target, path) || def;
};
