export type ElementModel = { get: ( key: string ) => unknown };

export type LegacyFilter< T > = ( value: T, model: ElementModel ) => T;

export type WindowWithHooks = {
	elementor?: {
		hooks?: {
			addFilter: < T >( name: string, callback: LegacyFilter< T > ) => void;
		};
	};
};
