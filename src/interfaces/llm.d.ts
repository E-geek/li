import { IBaseRequest, IBaseResponse, IResponseOkOrError } from './global';
import {JsonMap} from "@/interfaces/json";

export interface IGenerateRequest extends IBaseRequest {
  prompt :string;
}

export interface IGeneratedResult extends JsonMap {
  text :string;
}

export interface IGenerateResponseOk extends IBaseResponse {
  results :IGeneratedResult[];
}

export interface IGenerateResponseError extends IBaseResponse {
  detail :{
    [key :string] :string;
    msg	?:string;
    type	?:string;
  }
}

export type IGenerateResponse = IResponseOkOrError<IGenerateResponseOk, IGenerateResponseError>;
