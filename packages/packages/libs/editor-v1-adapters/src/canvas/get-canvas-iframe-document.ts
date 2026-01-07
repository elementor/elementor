type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
	};
};

export function getCanvasIframeDocument() {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	return extendedWindow.elementor?.$preview?.[ 0 ]?.contentDocument;
}
