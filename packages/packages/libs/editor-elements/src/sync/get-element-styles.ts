import { type StyleDefinition } from '@elementor/editor-styles';

import { type ElementID } from '../types';
import { getContainer } from './get-container';

export const getElementStyles = ( elementID: ElementID ): Record< string, StyleDefinition > | null => {
	const container = getContainer( elementID );

	return container?.model.get( 'styles' ) || null;
};
