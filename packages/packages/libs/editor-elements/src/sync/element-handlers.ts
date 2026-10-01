import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ElementHandler } from './types';

const HANDLERS_KEY = 'handlers';

export function getElementHandlers( elementId: ElementID ): ElementHandler[] {
	const container = getContainer( elementId );

	return container?.model?.get( HANDLERS_KEY ) ?? [];
}

export const updateElementHandlers = ( { elementId, handlers }: { elementId: ElementID; handlers: ElementHandler[] } ) => {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	element.model.set( HANDLERS_KEY, handlers );

	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};
