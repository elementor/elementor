import type { AngieInteractionMode, AngieTriggerRequest } from '@elementor-external/angie-sdk';

export type OpenAngieCommonProperties = {
	prompt: string;
	mode: AngieInteractionMode;
};

export type OpenAngieSdkProperties = {
	context?: AngieTriggerRequest[ 'context' ];
	options?: AngieTriggerRequest[ 'options' ];
};

export type OpenAngiePluginProperties = Record< string, never >;

export type OpenAngieRequest = OpenAngieCommonProperties & {
	sdk?: OpenAngieSdkProperties;
	plugin?: OpenAngiePluginProperties;
};

export type EditorAngieWindowHost = {
	openAngie?: ( request: OpenAngieRequest ) => Promise< void > | void;
};

declare global {
	interface ElementorV2Global {
		editorAngie?: EditorAngieWindowHost;
	}

	interface Window {
		elementorV2?: ElementorV2Global;
	}
}

export {};
