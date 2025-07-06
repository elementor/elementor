import { type AxiosResponse } from 'axios';

export const createMockHttpResponse = < T >( data: T ): AxiosResponse< T > => {
	return {
		data,
		status: 200,
		statusText: 'OK',
		headers: {},
		config: {},
	} as AxiosResponse< T >;
};
