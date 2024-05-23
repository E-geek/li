import type { IBaseResponse, ISmartError, Nullable } from '@/interfaces/global';
import { fetch } from './httpMock';
import type { Json, JsonMap } from '@/interfaces/json';
import { fetchMiddleware } from '@/services/middleware/fetch';

export type IFetchErrorMessage = Nullable<string | (string | ISmartError)[]>;

export interface IHTTPResponse<T extends IBaseResponse> {
  message ?:IFetchErrorMessage;
  errors ?:string[];
  isOk :boolean;
  data :T;
}

export type IHTTPPromise<T extends IBaseResponse> = Promise<IHTTPResponse<T>>;

let prefix = `//${location.host}`;

const credentials = {
  authToken: '',
  pid: '',
};

export const setCredentials = (at :string, pid :string) => {
  credentials.authToken = at;
  credentials.pid = pid;
};

export const overridePrefix = (newPrefix :string) => {
  prefix = newPrefix || `//${location.host}`; // when no prefix setup URI
};

export type IRequestBody = BodyInit | Json | JsonMap;

export interface IHTTPRequest {
  url :string;
  body ?:IRequestBody;
  options ?:RequestInit;
  customPrefix ?:string;
}

export function httpRequest<T extends IBaseResponse>(url :string) :IHTTPPromise<T>;
export function httpRequest<T extends IBaseResponse>(url :string, body :IRequestBody) :IHTTPPromise<T>;
export function httpRequest<T extends IBaseResponse>(params :IHTTPRequest) :IHTTPPromise<T>;

// eslint-disable-next-line max-len
export async function httpRequest<T extends IBaseResponse>(
  param1 :string | IHTTPRequest,
  param2 ?:IRequestBody,
) :IHTTPPromise<T> {
  let url :string;
  let body :Nullable<IRequestBody>;
  let options :Nullable<RequestInit>;
  let customPrefix :Nullable<string>;

  if (typeof param1 === 'string') {
    url = param1;
    body = param2;
  } else {
    url = param1.url;
    body = param1.body;
    options = param1.options;
    customPrefix = param1.customPrefix;
  }
  let requestUrl = (customPrefix ?? prefix) + url;
  try {
    const localOptions :RequestInit = {
      method: body ? 'POST' : 'GET',
      ...(options ?? {}),
    };
    if (body) {
      localOptions.headers = localOptions.headers ?? {};
      if (body instanceof FormData) {
        localOptions.body = body;
      } else {
        const headers = localOptions.headers as Record<string, string>;
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json;charset=UTF-8';
        }
        localOptions.body = JSON.stringify(body);
      }
      localOptions.mode = options?.mode || 'cors';
    } else if (credentials.pid && credentials.authToken) {
      const urlObject = new URL(requestUrl);
      urlObject.searchParams.append('pid', credentials.pid);
      urlObject.searchParams.append('authToken', credentials.authToken);
      requestUrl = urlObject.href;
    }
    const res = await fetch(requestUrl, localOptions);
    return await fetchMiddleware(res);
  } catch (e) {
    return await fetchMiddleware({
      message: `fetch ${url} failed`,
      errors: [ 'FETCH_FAILED' ],
      isOk: false,
      data: {} as T,
    } as IHTTPResponse<T>);
  }
}

export const fetchHasError = (data :IHTTPResponse<any>, error :string) :boolean => {
  return data.errors?.includes(error) ?? false;
};
