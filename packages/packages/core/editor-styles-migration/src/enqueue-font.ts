export type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
		helpers?: {
			enqueueFont?: EnqueueFont;
		};
	};
};

export const enqueueFont: EnqueueFont = ( fontFamily, context = 'editor' ) => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;
	return extendedWindow.elementor?.helpers?.enqueueFont?.( fontFamily, context ) ?? null;
};
