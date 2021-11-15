import { deepGet, hasOwnProperty, isArray, isNumberLike, toPath } from "./helper";
import { set, reactive, ref } from "@vue/composition-api";

const computeMatch = /^\$:/g;

export const getvalue = () => (value: string) => {
  if (typeof value !== "string" || !value.startsWith("=:")) {
    return false;
  }

  const handler = (context: Record<string, unknown>) => {
    const paths = value.replace("=:", "");
    const origin = deepGet(context, paths);

    if (origin === undefined) {
      SET(context, paths, null);
    }

    return origin;
  };

  return typeof value === "string" && value.startsWith("=:") && handler;
};

export const compute =
  ({ functional }) =>
  (value) => {
    const handler = (context) => {
      try {
        const keys = Object.keys(context);
        const funcKeys = Object.keys(functional);
        return new Function(...[...keys, ...funcKeys], `return ${value.replace(computeMatch, "")}`)(
          ...[...keys.map((key) => context[key]), ...funcKeys.map((key) => functional[key])],
        );
      } catch {
        //
      }
    };

    return typeof value === "string" && computeMatch.test(value) && handler;
  };

// export const assign =
//   ({ functional }: Record<string, unknown>) =>
//   (value: string) => {
//     const regx = /^(\$[\s\S.]+:)/g;

//     if (typeof value !== "string" || !regx.test(value)) {
//       return false;
//     }

//     const exprs = value.split(":");
//     const paths = exprs[0].substring(1, exprs[0].length);

//     const handler = (context: Record<string, unknown>) => {
//       try {
//         const keys = Object.keys(context);
//         const funcKeys = Object.keys(functional as Record<string, unknown>);
//         const action = (...args: any) =>
//           new Function(...[...keys, ...funcKeys], "arguments", `return ${value.replace(regx, "")}`)(
//             ...[
//               ...keys.map((key) => context[key]),
//               ...funcKeys.map((key) => (functional as Record<string, unknown>)[key]),
//             ],
//             args,
//           );

//         const origin = deepGet(context, paths);

//         if (origin === undefined) {
//           SET(context, paths, null);
//         }

//         return (...args: any) => {
//           SET(context, paths, action(...args));
//         };
//       } catch {
//         //
//       }
//     };

//     return handler;
//   };

export const SET = (target: Record<string, unknown>, path: string, value: unknown) => {
  const fields = isArray(path) ? path : toPath(path);
  const prop = (fields as any).shift();

  if (!fields.length) {
    return set(target, prop, value);
  }

  if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
    set(target, prop, objVal);
  }

  SET((target as any)[prop], fields as any, value);
};

export const GET = (target: Record<string, unknown>, path: string, def: unknown) => {
  const origin = deepGet(target, path);

  if (origin === undefined) {
    SET(target, path, def !== undefined && def !== null ? def : null);
  }

  return origin !== undefined ? origin : def;
};

export const rawData = (options: any) => {
  const data = options() || {};
  return reactive(data !== undefined && data !== null ? data : {});
};

export const REF = (target) => {
  return ref(target);
};
