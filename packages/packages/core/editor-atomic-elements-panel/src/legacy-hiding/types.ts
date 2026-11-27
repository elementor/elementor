// Minimal structural shapes of the Legacy panel's Backbone models and collections.
export type LegacyModel = {
	get: ( key: string ) => unknown;
	toJSON: () => Record< string, unknown >;
};

export type LegacyCollection = {
	models: LegacyModel[];
	clone: () => LegacyCollection;
	reset: ( models: unknown[] ) => unknown;
};

export type LegacyCollections = {
	elementsCollection: LegacyCollection;
	categoriesCollection: LegacyCollection;
};

type LegacyCollectionsFilter = ( collections: LegacyCollections ) => LegacyCollections;

export type WindowWithFilterHooks = {
	elementor?: {
		hooks?: {
			addFilter?: ( name: string, callback: LegacyCollectionsFilter ) => void;
		};
	};
};
