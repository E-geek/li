import type { JsonMap, Json } from './json';

export type Nullable<T> = T | null | undefined;

export type AnyFunction = (...args :any[]) =>any;
export type IFunction<T> = (...args :any[]) =>T;
export type ILangDict = { [P :string] :Record<string, string> };

export interface IBaseResponse extends JsonMap {
  message ?:string;
  [key :string] :Json;
}

export type IResponseOkOrError<OkType extends IBaseResponse, ErrorType extends IBaseResponse>
  = (OkType | ErrorType) & IBaseResponse;

export type Arrayble<T> = T | Array<T>;

export type ArraybleNullable<T> = T[] | T | null | undefined;

export interface ISmartError {
  message :string;
  button :string;
  action :AnyFunction;
}

declare global {
  interface Window {
    _globalKeyword :Nullable<string>;
    _globalTeaser :ArraybleNullable<string>;
  }
}
