import { AxiosInstance } from 'axios';
export { AxiosError, AxiosResponse } from 'axios';

type HttpResponse<TData, TMeta = Record<string, unknown>> = {
    data: TData;
    meta: TMeta;
};
declare const httpService: () => AxiosInstance;

export { type HttpResponse, httpService };
