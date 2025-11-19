import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ElementInteractions } from './types';

export function getElementInteractions( elementId: ElementID ): ElementInteractions | undefined {
	const container = getContainer( elementId );

	const interactions = container?.model?.get( 'interactions' );

	if ( typeof interactions === 'string' ) {
		return JSON.parse( interactions ) as ElementInteractions;
	}

	return interactions;
}
