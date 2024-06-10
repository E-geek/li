import {IDescAttribute} from "@/entity/Job";
import {JsonMap} from "@/interfaces/json";

export interface IVacancyShortMeta extends JsonMap {
  lid :number;
  jid :string;
  title :string;
  description :string;
  descMeta :IDescAttribute[];
  applies :number;
  views :number;
  isEasyApply :boolean;
  expireAt :number;
  publishedAt :number;
  origPublishAt :number;
}
