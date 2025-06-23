import axios, { type AxiosInstance } from 'axios';

import { env } from './env';

export type HttpResponse< TData, TMeta = Record< string, unknown > > = {
	data: TData;
	meta: TMeta;
};

let instance: AxiosInstance;

export const httpService = () => {
	if ( ! instance ) {
		instance = axios.create( {
			baseURL: env.base_url,
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				...env.headers,
			},
		} );
	}

	return instance;
};
