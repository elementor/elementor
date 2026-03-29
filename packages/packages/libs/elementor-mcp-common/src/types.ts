export interface WpApiSettings {
	nonce: string;
	root: string;
}

export interface ElementorContainer {
	id: string;
	model: {
		id: string;
		get: ( key: string ) => unknown;
	};
	settings: {
		get: ( key: string ) => unknown;
	};
}

export interface ElementorDocument {
	id: string;
	container: ElementorContainer;
	config?: {
		type?: string;
		settings?: Record< string, unknown >;
	};
}

export interface ElementorInstance {
	documents: {
		getCurrent: () => ElementorDocument | null;
	};
	getContainer: ( id: string ) => ElementorContainer | null;
	getCurrentElement: () => { model: { id: string } } | null;
	on: ( event: string, callback: () => void ) => void;
}

export interface ElementorFrontendInstance {
	elements: {
		$body: JQuery & HTMLElement[];
	};
	on: ( event: string, callback: () => void ) => void;
}

export interface ElementorCommandsInstance {
	run: ( command: string, args?: Record< string, unknown > ) => Promise< unknown >;
	components: {
		get: ( name: string ) => unknown;
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

declare global {
	interface Window {
		wpApiSettings?: WpApiSettings;
		ajaxurl?: string;
		elementor?: ElementorInstance;
		elementorFrontend?: ElementorFrontendInstance;
		$e?: ElementorCommandsInstance;
		ElementorAiConfig?: Record< string, unknown >;
		wp?: {
			data: WpDataInstance;
		};
		jQuery?: ( selector: unknown ) => {
			on: ( event: string, callback: ( event: unknown, data: unknown ) => void ) => void;
		};
	}
}
