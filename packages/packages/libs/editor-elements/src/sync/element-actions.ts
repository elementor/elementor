import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ElementActions } from './types';

const ACTIONS_KEY = 'actions';
const ACTIONS_VERSION = 1;

export function getElementActions( elementId: ElementID ): ElementActions {
	const container = getContainer( elementId );
	const actions = container?.model?.get( ACTIONS_KEY );

	return { version: ACTIONS_VERSION, items: Array.isArray( actions?.items ) ? actions.items : [] };
}

export const updateElementActions = ( {
	elementId,
	items,
}: {
	elementId: ElementID;
	items: ElementActions[ 'items' ];
} ) => {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	element.model.set( ACTIONS_KEY, { version: ACTIONS_VERSION, items } );

	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};
