import type { CanvasExtendedWindow } from './types';

export function getCanvasIframeDocument() {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	return extendedWindow.elementor?.$preview?.[ 0 ]?.contentDocument;
}
