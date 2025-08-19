export type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
		helpers?: {
			enqueueFont?: EnqueueFont;
		};
	};
};
