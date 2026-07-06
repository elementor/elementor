import type { ElementNode } from '@elementor/editor-v5-store';

import {
	applySavedElementsToEditorConfig,
	configureEditorAjax,
	prepareElementsForSave,
	requireDocumentId,
	runEditorAjaxRequest,
} from './editor-ajax';
import { getDocumentSettings } from './editor-config';

const DEFAULT_SAVE_STATUS = 'draft';

export async function saveDocument(
	elements: ElementNode[],
	status: string = DEFAULT_SAVE_STATUS
): Promise< unknown > {
	requireDocumentId();
	configureEditorAjax();

	const serializedElements = prepareElementsForSave( elements );
	const settings = getDocumentSettings();

	settings.post_status = status;

	const result = await runEditorAjaxRequest( 'save_builder', {
		elements: serializedElements,
		settings,
		status,
	} );

	applySavedElementsToEditorConfig( serializedElements );

	return result;
}
