import { type ElementID } from '../types';
import { getContainer } from './get-container';

export function getElementEditorSettings( elementId: ElementID ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return {};
	}

	return container.model.get( 'editor_settings' ) ?? {};
}
