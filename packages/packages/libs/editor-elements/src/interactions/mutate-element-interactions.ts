import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from '../sync/get-container';
import { ELEMENT_INTERACTIONS_CHANGE_EVENT } from './consts';

type Mutator = ( interactions: string ) => string;

export function mutateElementInteractions( elementId: ElementID, mutator: Mutator ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

    const raw = container.model.get( 'interactions' );
    const current = typeof raw === 'string' ? raw : JSON.stringify( raw ?? [] );	const next = mutator( current );

	if ( next === current ) {
		return;
	}

	container.model.set( 'interactions', next );

	window.dispatchEvent(
		new CustomEvent( ELEMENT_INTERACTIONS_CHANGE_EVENT, {
			detail: { elementId, interactions: next },
		} )
	);

	setDocumentModifiedStatus( true );
}

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
