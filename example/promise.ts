import {AnyFunction} from "@/interfaces/global";

export interface IPromise<T> {
  promise :Promise<T>;
  done :(...args) =>void;
  fail :(...args) =>void;
  resolved :boolean;
}

export const promise = <T>() :IPromise<T> => {
  let extRes;
  let extRej;
  const promise = new Promise<T>((res, rej) => {
    extRes = res;
    extRej = rej;
  });
  const done = (...args) => {
    extRes(...args);
  };
  const fail = (...args) => {
    extRej(...args);
  };
  const iPromise = { promise, done, fail, resolved: false };
  promise.then((arg) => {
    iPromise.resolved = true;
    return arg;
  }).catch((arg) => {
    iPromise.resolved = true;
    return arg;
  });
  return iPromise;
};

export function wait(time :number) :Promise<undefined>;
export function wait(time :number, cb :AnyFunction) :number;

export function wait(time :number, cb ?:AnyFunction) {
  if (cb) {
    return setTimeout(cb, time) as unknown as number;
  }
  return new Promise<undefined>((resolve :AnyFunction) => {
    setTimeout(resolve, time);
  });
}

export const promiseWithTimeout = <T>(timeout :number, func :(() =>Promise<T>)|Promise<T>) :Promise<T> => {
  return new Promise<T>((res, rej) => {
    const timer = wait(timeout, () => {
      rej(Error('Promise timeout'));
    });
    (async() => {
      let result :T;
      try {
        if (typeof func === 'function') {
          result = await func();
        } else {
          result = await func;
        }
      } catch (err) {
        rej(err);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clearTimeout(timer as any); // nodejs: Timeout, web: number => any!
      res(result);
    })();
  });
};
