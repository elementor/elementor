export type RequestParams< TData = object > = {
	action: string;
	unique_id: string;
	data: TData;
};

type Headers< TData = object > = RequestParams< TData > & {
	success: ( result: unknown ) => void;
	error: ( error: unknown ) => void;
};

export type ExtendedWindow = Window & {
	elementorCommon?: {
		ajax?: {
			load: ( data: Headers ) => Promise< unknown >;
			invalidateCache: ( data: RequestParams ) => void;
		};
	};
};
