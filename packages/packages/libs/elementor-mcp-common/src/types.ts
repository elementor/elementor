export interface WpApiSettings {
	nonce: string;
	root: string;
}

export interface ElementorContainer {
	id: string;
	model: {
		id: string;
		get: ( key: string ) => unknown;
		attributes?: Record< string, unknown >;
		editor_settings?: { title?: string };
	};
	settings: {
		get: ( key: string ) => unknown;
		attributes?: Record< string, unknown >;
		controls?: Record< string, unknown >;
	};
	children?: ElementorContainer[];
	view?: {
		el: HTMLElement;
	};
	parent?: ElementorContainer;
}

export interface ElementorDocument {
	id: string;
	container: ElementorContainer;
	config?: {
		type?: string;
		settings?: Record< string, unknown >;
	};
	editor?: {
		status?: string;
		isChanged?: boolean;
	};
	history?: {
		active?: boolean;
		setActive?: ( active: boolean ) => void;
	};
}

export interface ElementorChannels {
	deviceMode?: {
		request: ( key?: string ) => unknown;
	};
	dataEditMode?: {
		request: ( key?: string ) => unknown;
	};
}

export interface ElementorInstance {
	documents: {
		getCurrent: () => ElementorDocument | null;
		get?: ( id: string | number ) => ElementorDocument | null;
	};
	getContainer: ( id: string ) => ElementorContainer | null;
	getCurrentElement: () => { model: { id: string } } | null;
	on: ( event: string, callback: () => void ) => void;
	config?: {
		responsive?: {
			breakpoints?: Record< string, unknown >;
		};
		controls?: Record< string, unknown >;
		v4Promotions?: Record< string, unknown >;
		default_schemes?: Record< string, unknown >;
		atomicDynamicTags?: {
			tags?: Record< string, unknown >;
			groups?: Record< string, unknown >;
		};
	};
	helpers?: {
		hasPro?: () => boolean;
		enqueueFont?: ( font: string ) => void;
	};
	$preview?: [ HTMLIFrameElement ];
	selection?: {
		elements?: Record< string, unknown >;
		getElements?: () => unknown[];
	};
	hooks?: {
		addFilter: ( name: string, callback: ( ...args: unknown[] ) => unknown ) => void;
	};
	dynamicTags?: {
		getConfig: ( key: string ) => Record< string, unknown >;
		tagDataToTagText: ( id: string, name: string, settings: Record< string, unknown > ) => string;
		createTag?: ( options: Record< string, unknown > ) => unknown;
		loadTagDataFromCache?: ( tag: unknown, key: string ) => unknown;
		refreshCacheFromServer?: ( tag: unknown, callback: () => void ) => void;
	};
	widgetsCache?: Record<
		string,
		{
			controls?: Record< string, unknown >;
			title?: string;
			atomic_controls?: unknown[];
		}
	>;
	channels?: ElementorChannels;
	getPanelView?: () => {
		getHeaderView?: () => {
			setTitle?: ( title: string ) => void;
		};
		getCurrentPageView?: () => unknown;
	};
	getPreferences?: ( key: string ) => unknown;
	changeEditMode?: ( mode: string ) => void;
	modules?: Record< string, unknown >;
}

export interface ElementorFrontendInstance {
	elements: {
		$body: JQuery & HTMLElement[];
	};
	on: ( event: string, callback: () => void ) => void;
	config?: {
		responsive?: {
			activeBreakpoints?: Record< string, unknown >;
		};
		kit?: {
			active_breakpoints?: string[];
		};
		experimentalFeatures?: Record< string, boolean >;
		is_rtl?: boolean;
	};
}

export interface ElementorCommandsInstance {
	run: ( command: string, args?: Record< string, unknown > ) => Promise< unknown >;
	components: {
		get: ( name: string ) => {
			getCommands?: () => {
				open?: { registerConfig: { command: string } };
				close?: { registerConfig: { command: string } };
			};
			getNamespace?: () => string;
		} | null;
		getAll?: () => string[];
	};
	routes?: {
		getAll?: () => string[];
		isPartOf?: ( route: string ) => boolean;
		to?: ( route: string, args?: Record< string, unknown > ) => void;
		register?: ( route: string, callback: () => void ) => void;
		saveState?: ( namespace: string ) => void;
		back?: ( namespace: string ) => void;
		getComponent?: ( route: string ) => { getNamespace: () => string };
	};
	data?: {
		get?: ( key: string ) => Promise< unknown >;
	};
	modules?: {
		hookData?: Record< string, unknown >;
	};
}

export interface WpDataInstance {
	select: ( store: string ) => Record< string, unknown > | undefined;
	dispatch: ( store: string ) => Record< string, unknown >;
}

type JQuery = {
	resize: () => void;
	[ index: number ]: HTMLElement;
};

export interface ElementorCommonInstance {
	eventsManager?: {
		dispatchEvent?: ( name: string, data: unknown, options?: Record< string, unknown > ) => void;
		canSendEvents?: () => boolean;
		initializeMixpanel?: ( onLoaded: ( mpInstance?: unknown ) => void ) => void;
		config?: Record< string, unknown >;
	};
	config?: {
		isRTL?: boolean;
		version?: string;
		experimentalFeatures?: Record< string, boolean >;
		urls?: Record< string, string >;
	};
	helpers?: {
		getUniqueId?: () => number | string;
	};
	ajax?: {
		addRequest?: ( endpoint: string, options: { success?: ( data: unknown ) => void } ) => Promise< void >;
	};
}

declare global {
	interface Window {
		wpApiSettings?: WpApiSettings;
		ajaxurl?: string;
		elementor?: ElementorInstance;
		elementorFrontend?: ElementorFrontendInstance;
		elementorCommon?: ElementorCommonInstance;
		$e?: ElementorCommandsInstance;
		ElementorAiConfig?: Record< string, unknown >;
		wp?: {
			data: WpDataInstance;
		};
		jQuery?: ( selector: unknown ) => {
			on: ( event: string, callback: ( event: unknown, data: unknown ) => void ) => void;
			get?: ( index: number ) => HTMLElement;
		};
	}
}
