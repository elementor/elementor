import { type CanvasExtendedWindow, type EnqueueFont } from './types';

export const enqueueFont: EnqueueFont = ( fontFamily, context = 'preview' ) => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	return extendedWindow.elementor?.helpers?.enqueueFont?.( fontFamily, context ) ?? null;
};
