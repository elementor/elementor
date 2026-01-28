import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1ElementModelProps } from '..';
import { getContainer } from './get-container';
import { findModel } from './get-model';

export const updateElementEditorSettings = ( {
	elementId,
	settings,
}: {
	elementId: string;
	settings: V1ElementModelProps[ 'editor_settings' ];
} ) => {
	const element = getContainer( elementId );

	if ( element ) {
		updateViaContainer( element, settings );
		return;
	}

	updateViaModel( elementId, settings );
};

function updateViaContainer(
	element: NonNullable< ReturnType< typeof getContainer > >,
	settings: V1ElementModelProps[ 'editor_settings' ]
) {
	const editorSettings = element.model.get( 'editor_settings' ) ?? {};

	element.model.set( 'editor_settings', { ...editorSettings, ...settings } );

	setDocumentModifiedStatus( true );
}

function updateViaModel( elementId: string, settings: V1ElementModelProps[ 'editor_settings' ] ) {
	const result = findModel( elementId );

	if ( ! result ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	const { model } = result;
	const editorSettings = model.get( 'editor_settings' ) ?? {};

	model.set( 'editor_settings', { ...editorSettings, ...settings } );

	setDocumentModifiedStatus( true );
}

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
