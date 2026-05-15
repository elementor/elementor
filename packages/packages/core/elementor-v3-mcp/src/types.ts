export type ToolParams = {
	[ key: string ]: unknown;
	action: string;
};

export type McpToolResult = {
	content: Array< {
		type: 'text';
		text: string;
	} >;
};

export interface ElementorContainer {
	id: string;
	model: {
		id: string;
		attributes?: Record< string, unknown >;
		editor_settings?: { title?: string };
		get?: ( key: string ) => unknown;
	};
	settings: {
		attributes?: Record< string, unknown >;
		controls?: Record< string, unknown >;
		get: ( key: string ) => unknown;
	};
	children?: ElementorContainer[];
	view?: {
		el: HTMLElement;
	};
	parent?: ElementorContainer;
}

export interface ElementorControls {
	[ key: string ]: {
		type: string;
		default?: unknown;
		options?: Record< string, string >;
		fields?: ElementorControls;
	};
}

export type ElementorControlsMapped = {
	[ key: string ]: {
		default: unknown;
		options?: string[];
		onValue?: string;
		size_units?: string[];
		range?: { min: number; max: number };
		type: string;
		fields?: ElementorControlsMapped;
	};
};

export interface ElementorDocument {
	id: string;
	container: ElementorContainer & { children: ElementorContainer[] };
	config: {
		type: string;
		settings: Record< string, unknown > & {
			controls?: ElementorControls;
			settings?: Record< string, unknown >;
		};
	};
}

export interface ElementorInstance {
	documents: {
		getCurrent: () => ElementorDocument | null;
		get: ( id: string ) => {
			config?: {
				settings: {
					controls: ElementorControls;
					settings: Record< string, unknown >;
				};
			};
		} | null;
	};
	getContainer: ( id: string ) => ElementorContainer | null;
	getCurrentElement: () => { model: { id: string } } | null;
	selection: {
		elements: Record< string, unknown >;
	};
	widgetsCache: Record< string, { controls: ElementorControls } >;
	config: {
		controls: Record< string, unknown >;
	};
	dynamicTags?: {
		getConfig: ( key: string ) => Record< string, { categories: string[] } >;
		tagDataToTagText: ( id: string, name: string, settings: Record< string, unknown > ) => string;
	};
}

export interface ElementorCommandsInstance {
	run: ( command: string, args?: Record< string, unknown > ) => Promise< unknown >;
	data: {
		get: ( key: string ) => Promise< { data: Record< string, { value: unknown } > } >;
	};
	routes: {
		getAll: () => string[];
		getComponent: ( route: string ) => { getNamespace: () => string };
		saveState: ( namespace: string ) => void;
		to: ( route: string, args: Record< string, unknown > ) => void;
		back: ( namespace: string ) => void;
	};
	components: {
		getAll: () => string[];
		get: ( name: string ) => {
			getCommands: () => {
				open?: { registerConfig: { command: string } };
				close?: { registerConfig: { command: string } };
			};
		};
	};
}

export interface ElementorCommonInstance {
	helpers?: {
		getUniqueId?: () => number | string;
	};
}
