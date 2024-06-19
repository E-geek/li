import {IDescAttribute} from "@/entity/Job";
import {JsonMap} from "@/interfaces/json";
import {IBaseResponse, IResponseOkOrError} from "@/interfaces/global";

export type JOB_DECLINED = 1;
export type JOB_APPLIED = 2;

export type IJobStatus = 0 | JOB_DECLINED | JOB_APPLIED | 3;

export interface IVacancyShortMeta extends JsonMap {
  lid :number;
  jid :string;
  title :string;
  description :string;
  descMeta :IDescAttribute[];
  descHTML ?:string|null; // internal use
  i18nHTML ?:string|null;
  applies :number;
  views :number;
  isEasyApply :boolean;
  expireAt :number;
  publishedAt :number;
  origPublishAt :number;
  status :IJobStatus;
}

export interface IJobDoneRequest extends JsonMap {
  jid :string;
  status :IJobStatus;
}

export interface IJobDoneResponseOk extends IBaseResponse {}

export interface IJobDoneResponseError extends IBaseResponse {
  error :'Job not found',
}

export type IJobDoneResponse = IResponseOkOrError<IJobDoneResponseOk, IJobDoneResponseError>;


export interface ITranslateRequest extends JsonMap {
  jid :string;
  description :string;
}

export interface ITranslateResponseOk extends IBaseResponse {
  description :string;
}

export interface ITranslateResponseError extends IBaseResponse {
  error :'Someone went wrong',
}

export type ITranslateResponse = IResponseOkOrError<ITranslateResponseOk, ITranslateResponseError>;
