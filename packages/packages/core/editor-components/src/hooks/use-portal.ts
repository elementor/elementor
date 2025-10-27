import { getCanvasIframeDocument } from '@elementor/editor-canvas';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

export function usePortal() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument() );
}