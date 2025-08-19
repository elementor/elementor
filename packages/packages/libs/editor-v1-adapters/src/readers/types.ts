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
	};
};
