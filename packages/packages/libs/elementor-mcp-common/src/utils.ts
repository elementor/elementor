import type {
	ElementorCommandsInstance,
	ElementorCommonInstance,
	ElementorFrontendInstance,
	ElementorInstance,
	WpApiSettings,
	WpDataInstance,
} from './types';

interface McpWindow {
	elementor?: ElementorInstance;
	elementorFrontend?: ElementorFrontendInstance;
	$e?: ElementorCommandsInstance;
	elementorCommon?: ElementorCommonInstance;
	wpApiSettings?: WpApiSettings;
	ajaxurl?: string;
	wp?: {
		data: WpDataInstance;
	};
	jQuery?: ( selector: unknown ) => {
		on: ( event: string, callback: ( event: unknown, data: unknown ) => void ) => void;
		get?: ( index: number ) => HTMLElement;
	};
	ElementorAiConfig?: Record< string, unknown >;
}

export const getElementor = (): ElementorInstance | undefined => ( window as unknown as McpWindow ).elementor;

export const getElementorFrontend = (): ElementorFrontendInstance | undefined =>
	( window as unknown as McpWindow ).elementorFrontend;

export const get$e = (): ElementorCommandsInstance | undefined => ( window as unknown as McpWindow ).$e;

export const getElementorCommon = (): ElementorCommonInstance | undefined =>
	( window as unknown as McpWindow ).elementorCommon;

export const getWpApiSettings = (): WpApiSettings | undefined => ( window as unknown as McpWindow ).wpApiSettings;

export const getAjaxUrl = (): string | undefined => ( window as unknown as McpWindow ).ajaxurl;

export const getWp = (): { data: WpDataInstance } | undefined => ( window as unknown as McpWindow ).wp;

export const getJQuery = (): McpWindow[ 'jQuery' ] => ( window as unknown as McpWindow ).jQuery;

export const getElementorAiConfig = (): Record< string, unknown > | undefined =>
	( window as unknown as McpWindow ).ElementorAiConfig;
