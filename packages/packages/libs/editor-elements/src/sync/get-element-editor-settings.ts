import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { findModel } from './get-model';

export function getElementEditorSettings( elementId: ElementID ) {
	const container = getContainer( elementId );

	if ( container ) {
		return container.model.get( 'editor_settings' ) ?? {};
	}

	const result = findModel( elementId );

	if ( ! result ) {
		return {};
	}

	return result.model.get( 'editor_settings' ) ?? {};
}
