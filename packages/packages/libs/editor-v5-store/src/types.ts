export type ElementNode = {
	id: string;
	elType: string;
	widgetType?: string;
	settings: Record< string, unknown >;
	styles?: Record< string, unknown >;
	interactions?: Record< string, unknown >;
	editor_settings?: Record< string, unknown >;
	elements: ElementNode[];
	isInner?: boolean;
};

export type AtomicWidgetConfig = {
	title: string;
	name: string;
	atomic_controls?: unknown[];
	atomic_props_schema?: Record< string, unknown >;
	[ key: string ]: unknown;
};

export type DocumentState = {
	elements: ElementNode[];
	selectedIds: string[];
	dirty: boolean;
};
