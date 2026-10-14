import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1ElementModelProps } from '..';
import { getContainer } from './get-container';

export const updateElementEditorSettings = ( {
	elementId,
	settings,
}: {
	elementId: string;
	settings: V1ElementModelProps[ 'editor_settings' ];
} ) => {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	const editorSettings = element.model.get( 'editor_settings' ) ?? {};

	element.model.set( 'editor_settings', { ...editorSettings, ...settings } );

	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};
