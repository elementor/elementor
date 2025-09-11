export type AjaxRequest = {
	action: string;
	unique_id: string;
	data: object;
	success: ( result: unknown ) => void;
	error: ( error: unknown ) => void;
};

export type ExtendedWindow = Window & {
	elementorCommon?: {
		ajax?: {
			load: ( data: AjaxRequest ) => Promise< unknown >;
			invalidateCache: ( data: Partial< AjaxRequest > ) => void;
		};
	};
};
