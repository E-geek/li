import {Injectable} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {IGenerateRequest, IGenerateResponse, IGenerateResponseOk} from "@/interfaces/llm";

@Injectable()
export class LlmService {
  async translate(text :string) :Promise<string|null> {
    const res = await axios.post<any, AxiosResponse<IGenerateResponse>, IGenerateRequest>(
      'http://localhost:5001/api/v1/generate', {
        prompt: `Translate the following text from English into Russian. Don't add something else. Be a great translator only.English:
${text}

Russian:`,
        max_length:	(text.length * 1.2 / 2.8)|0,
        n: 1
      });
    if ((res.data as IGenerateResponseOk).results) {
      const ok = res.data as IGenerateResponseOk;
      return ok.results.length === 0 ? null : ok.results[0].text;
    }
    return null;
  }
}
