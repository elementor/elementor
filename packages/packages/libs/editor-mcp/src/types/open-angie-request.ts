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

declare global {
	interface Window {
		elementorV2?: Window[ 'elementorV2' ] & {
			editorAngie?: {
				openAngie?: ( request: OpenAngieRequest ) => Promise< void > | void;
			};
		};
	}
}

export {};
