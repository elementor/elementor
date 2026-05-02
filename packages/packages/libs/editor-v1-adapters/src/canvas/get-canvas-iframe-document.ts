export function getCanvasIframeDocument() {
	return window.elementor?.$preview?.[ 0 ]?.contentDocument;
}
