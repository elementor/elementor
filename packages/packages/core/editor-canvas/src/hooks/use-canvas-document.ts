import {
	__privateUseListenTo as useListenTo,
	commandEndEvent,
	getCanvasIframeDocument,
} from '@elementor/editor-v1-adapters';

export function useCanvasDocument() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument() );
}
