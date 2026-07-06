import type { ElementNode } from '@elementor/editor-v5-store';

import { formatAjaxError } from './ajax-errors';
import { getDocumentId, syncElementsToEditorConfig } from './editor-config';
import { serializeElementsForSave } from './serialize';

type ElementorCommonAjax = {
	addRequest: (
		action: string,
		options: {
			data: Record< string, unknown >;
			error?: ( data: unknown ) => void;
			success?: ( data: unknown ) => void;
		},
		immediately?: boolean
	) => {
		deferred: {
			fail: ( callback: ( response: unknown ) => void ) => void;
		};
	};
	addRequestConstant: ( key: string, value: unknown ) => void;
};

type ElementorCommonWindow = Window & {
	elementorCommon?: {
		ajax?: ElementorCommonAjax;
	};
};

export function getEditorAjax(): ElementorCommonAjax {
	const ajax = ( window as ElementorCommonWindow ).elementorCommon?.ajax;

	if ( ! ajax?.addRequest || ! ajax.addRequestConstant ) {
		throw new Error( 'elementorCommon.ajax is not available.' );
	}

	return ajax;
}

export function configureEditorAjax(): void {
	const documentId = getDocumentId();
	const ajax = ( window as ElementorCommonWindow ).elementorCommon?.ajax;

	if ( ! documentId || ! ajax?.addRequestConstant ) {
		return;
	}

	ajax.addRequestConstant( 'editor_post_id', documentId );
	ajax.addRequestConstant( 'initial_document_id', documentId );
}

export function requireDocumentId(): number {
	const documentId = getDocumentId();

	if ( ! documentId ) {
		throw new Error( 'Document ID is not available.' );
	}

	return documentId;
}

export function runEditorAjaxRequest(
	action: string,
	data: Record< string, unknown >
): Promise< unknown > {
	const ajax = getEditorAjax();

	return new Promise( ( resolve, reject ) => {
		const request = ajax.addRequest(
			action,
			{
				data,
				error: ( response ) => reject( formatAjaxError( response ) ),
				success: ( response ) => resolve( response ),
			},
			true
		);

		request.deferred.fail( ( response ) => reject( formatAjaxError( response ) ) );
	} );
}

export function prepareElementsForSave( elements: ElementNode[] ): ElementNode[] {
	return serializeElementsForSave( elements );
}

export function applySavedElementsToEditorConfig( elements: ElementNode[] ): void {
	syncElementsToEditorConfig( elements );
}
