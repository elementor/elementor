export type RequestParams< TData = object > = {
	action: string;
	unique_id: string;
	data: TData;
};

type Headers< TRequestData = object, TResponseData = object > = RequestParams< TRequestData > & {
	success: ( result: TResponseData ) => void;
	error: ( error: unknown ) => void;
};

export type ExtendedWindow = Window & {
	elementorCommon?: {
		ajax?: {
			load: < TRequestData = object, TResponseData = object >(
				data: Headers< TRequestData, TResponseData >
			) => Promise< unknown >;
			invalidateCache: < TRequestData = object >( data: RequestParams< TRequestData > ) => void;
		};
	};
};
