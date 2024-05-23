import {JsonMap} from "@/interfaces/json";
import {IBaseResponse, IResponseOkOrError} from "@/interfaces/global";

export interface ISimpleRequestRequest extends JsonMap {
  name :string;
  value :number;
  lang ?:string;
}

export interface ISimpleRequestResponseOk extends IBaseResponse {
  company :number;
}

export interface ISimpleRequestResponseError extends IBaseResponse {
  message :string | null;
}

export type ISimpleRequestResponse = IResponseOkOrError<ISimpleRequestResponseOk, ISimpleRequestResponseError>;
