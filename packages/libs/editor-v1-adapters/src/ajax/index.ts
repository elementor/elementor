import { type ExtendedWindow, type RequestParams } from './types';

export const ajax = {
	async load< TRequestData = object, TResponseData = object >(
		data: RequestParams< TRequestData >
	): Promise< TResponseData > {
		const extendedWindow = window as unknown as ExtendedWindow;

		return new Promise( ( success, error ) => {
			extendedWindow.elementorCommon?.ajax?.load< TRequestData, TResponseData >( {
				...data,
				success,
				error,
			} );
		} );
	},
	invalidateCache< TData = object >( data: RequestParams< TData > ) {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementorCommon?.ajax?.invalidateCache< TData >( data );
	},
};
