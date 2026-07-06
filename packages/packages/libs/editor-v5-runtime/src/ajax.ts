import type { ElementNode } from '@elementor/editor-v5-store';

import {
	applySavedElementsToEditorConfig,
	configureEditorAjax,
	prepareElementsForSave,
} from './editor-ajax';
import { getDocumentSettings } from './editor-config';

const DEFAULT_SAVE_STATUS = 'draft';

type ElementorCommonWindow = Window & {
	elementorCommon?: {
		ajax?: {
			addRequest: (
				action: string,
				options: {
					data: Record< string, unknown >;
					error?: ( data: unknown ) => void;
				},
				immediately?: boolean
			) => Promise< unknown >;
		};
	};
};

export async function saveDocument(
	elements: ElementNode[],
	status: string = DEFAULT_SAVE_STATUS
): Promise< unknown > {
	configureEditorAjax();

	const ajax = ( window as ElementorCommonWindow ).elementorCommon?.ajax;

	if ( ! ajax ) {
		throw new Error( 'elementorCommon.ajax is not available.' );
	}

	const serializedElements = prepareElementsForSave( elements );
	const settings = getDocumentSettings();

	settings.post_status = status;

	const result = await ajax.addRequest(
		'save_builder',
		{
			data: {
				elements: serializedElements,
				settings,
				status,
			},
		},
		true
	);

	applySavedElementsToEditorConfig( serializedElements );

	return result;
}
