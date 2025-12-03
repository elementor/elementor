import { type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';

import { type StorageContent } from '../prevent-link-in-link-commands';
export type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type ElementModelProps = Omit< V1ElementModelProps, 'id' > & {
	custom: {
		isPreset: boolean;
		preset_settings?: V1ElementSettingsProps;
	};
};

type Channel = {
	reply: ( event: string, data: unknown ) => Channel;
	trigger: ( event: string ) => void;
};

type ElementorChannels = {
	editor: Channel;
	panelElements: Channel;
};

export type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
		helpers?: {
			enqueueFont?: EnqueueFont;
		};
		channels?: ElementorChannels;
		modules?: {
			elements?: {
				models?: {
					Element?: new ( props: ElementModelProps ) => unknown;
				};
			};
		};
	};
	elementorCommon?: {
		storage?: {
			get: ( key?: string ) => StorageContent;
		};
		config?: {
			urls?: {
				assets?: string;
			};
		};
	};
};
