import { deepGet, hasOwnProperty, isArray, isNumberLike, toPath } from "./helper";
import { set, reactive, ref } from "vue";

export const SET = (target, path: string, value: unknown) => {
  const fields = isArray(path) ? path : toPath(path);
  const prop = fields.shift();

  if (!fields.length) {
    return set(target, prop, value);
  }

  if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
    set(target, prop, objVal);
  }

  SET(target[prop], fields, value);
};

export const GET = (target: Record<string, unknown>, path: string, def: unknown) => {
  const origin = deepGet(target, path);

  if (origin === undefined || origin === null) {
    SET(target, path, def !== undefined && def !== null ? def : null);
  }

  return origin !== undefined ? origin : def;
};

export const rawData = (options) => {
  const data = options() || {};
  return ref(data !== undefined && data !== null ? data : {});
};

export const REF = (target) => {
  return ref(target);
};
