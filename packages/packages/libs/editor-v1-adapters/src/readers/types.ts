export type ExtendedWindow = Window & {
	$e: {
		routes: {
			isPartOf: ( route: string ) => boolean;
		};
	};
	elementorCommon?: {
		config?: {
			experimentalFeatures?: Record< string, boolean >;
		};
		ajax?: {
			load: ( data: {
				action: string;
				unique_id: string;
				data: {
					id: number;
				};
				success: ( result: unknown ) => void;
				error: ( error: unknown ) => void;
			} ) => Promise< unknown >;
		};
	};
};
