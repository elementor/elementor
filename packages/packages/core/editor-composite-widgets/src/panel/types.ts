export type SelectedContainer = {
	id: string;
	parent?: { id: string; model: { get: ( key: string ) => { findIndex: ( model: unknown ) => number } } };
	model: { get: ( key: string ) => unknown };
	view?: { $el?: Array< Node > };
};

export type PanelChannel = {
	on: ( event: string, callback: () => void ) => void;
	off: ( event: string, callback: () => void ) => void;
};

export type PanelExtendedWindow = {
	elementor?: {
		selection?: { getElements: () => SelectedContainer[] };
		getPreviewContainer?: () => { id: string } | undefined;
		documents?: { getCurrent?: () => { $element?: Array< Node > } | undefined };
		userCan?: ( capability: string ) => boolean;
		channels?: { panelElements?: PanelChannel };
	};
	elementorCommon?: {
		eventsManager?: { dispatchEvent?: ( name: string, data: Record< string, unknown > ) => void };
	};
};
