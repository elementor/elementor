import { type ElementID } from '../types';
import { getContainer } from './get-container';

export function getElementEditorSettings( elementId: ElementID ) {
	const container = getContainer( elementId );

	return container?.model.get( 'editor_settings' ) ?? {};
}
