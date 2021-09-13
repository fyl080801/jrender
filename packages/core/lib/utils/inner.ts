import { deepGet, deepSet, hasOwnProperty, isArray, isNumberLike, toPath } from "./helper";
import { set } from "vue-demi";

export const compute =
  ({ functional }: Record<string, unknown>) =>
  (value: string) => {
    const handler = (context: Record<string, unknown>) => {
      try {
        const keys = Object.keys(context);
        const funcKeys = Object.keys(functional as Record<string, unknown>);
        return new Function(...[...keys, ...funcKeys], `return ${value.replace("=:", "")}`)(
          ...[
            ...keys.map((key) => context[key]),
            ...funcKeys.map((key) => (functional as Record<string, unknown>)[key]),
          ],
        );
      } catch {
        //
      }
    };

    return typeof value === "string" && value.startsWith("=:") && handler;
  };

export const assign =
  ({ functional }: Record<string, unknown>) =>
  (value: string) => {
    const regx = /^(=[\s\S]+:)/g;

    if (typeof value !== "string" || !regx.test(value)) {
      return false;
    }

    const exprs = value.split(":");
    const paths = exprs[0].substring(1, exprs[0].length);

    const handler = (context: Record<string, unknown>) => {
      try {
        const keys = Object.keys(context);
        const funcKeys = Object.keys(functional as Record<string, unknown>);
        const action = (...args: any) =>
          new Function(...[...keys, ...funcKeys], "arguments", `return ${value.replace(regx, "")}`)(
            ...[
              ...keys.map((key) => context[key]),
              ...funcKeys.map((key) => (functional as Record<string, unknown>)[key]),
            ],
            args,
          );

        const origin = deepGet(context, paths);

        if (origin === undefined) {
          UPDATE(context, paths, null);
        }

        return (...args: any) => {
          deepSet(context, paths, action(...args));
        };
      } catch {
        //
      }
    };

    return handler;
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
