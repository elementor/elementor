import type { ElementNode } from '@elementor/editor-v5-store';

import { getDocumentId, syncElementsToEditorConfig } from './editor-config';
import { serializeElementsForSave } from './serialize';

type ElementorCommonAjax = {
	addRequestConstant: ( key: string, value: unknown ) => void;
};

type ElementorCommonWindow = Window & {
	elementorCommon?: {
		ajax?: ElementorCommonAjax;
	};
};

export function configureEditorAjax(): void {
	const documentId = getDocumentId();
	const ajax = ( window as ElementorCommonWindow ).elementorCommon?.ajax;

	if ( ! documentId || ! ajax?.addRequestConstant ) {
		return;
	}

	ajax.addRequestConstant( 'editor_post_id', documentId );
	ajax.addRequestConstant( 'initial_document_id', documentId );
}

export function prepareElementsForSave( elements: ElementNode[] ): ElementNode[] {
	return serializeElementsForSave( elements );
}

export function applySavedElementsToEditorConfig( elements: ElementNode[] ): void {
	syncElementsToEditorConfig( elements );
}
