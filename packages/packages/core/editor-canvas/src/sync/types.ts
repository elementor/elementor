import { type StorageContent } from '../prevent-link-in-link-commands';

export type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
		helpers?: {
			enqueueFont?: EnqueueFont;
		};
	};
	elementorCommon?: {
		storage?: {
			get: ( key?: string ) => StorageContent;
		};
	};
};
