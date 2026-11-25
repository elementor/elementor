export type SelectedContainer = {
	id: string;
	parent?: { id: string; model: { get: ( key: string ) => { findIndex: ( model: unknown ) => number } } };
	model: { get: ( key: string ) => unknown };
	view?: { $el?: Array< Node > };
};

export type PromotionWidget = {
	name: string;
	title: string;
	icon?: string;
	categories?: string;
};

export type AtomicWidgetPromotion = {
	type: string;
	widgets?: PromotionWidget[];
};

export type PanelChannel = {
	on: ( event: string, callback: () => void ) => void;
	off: ( event: string, callback: () => void ) => void;
};

export type ExtendedWindow = {
	elementor?: {
		selection?: { getElements: () => SelectedContainer[] };
		getPreviewContainer?: () => { id: string } | undefined;
		documents?: { getCurrent?: () => { $element?: Array< Node > } | undefined };
		userCan?: ( capability: string ) => boolean;
		channels?: { editor?: unknown; panelElements?: PanelChannel };
		modules?: { elements?: { models?: { Element?: unknown } } };
		hooks?: {
			addAction: ( name: string, callback: () => void ) => void;
			removeAction: ( name: string, callback: () => void ) => void;
		};
		config?: { atomicWidgetPromotions?: AtomicWidgetPromotion[] };
	};
	elementorCommon?: {
		eventsManager?: { dispatchEvent?: ( name: string, data: Record< string, unknown > ) => void };
	};
};
