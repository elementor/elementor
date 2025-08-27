import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	edit?: boolean;
};

export type MoveElementParams = {
	elementId: string;
	targetContainerId: string;
	options?: Options;
};

export function moveElement( { elementId, targetContainerId, options = {} }: MoveElementParams ) {
	const container = getContainer( elementId );
	const target = getContainer( targetContainerId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	if ( ! target ) {
		throw new Error( `Target container with ID "${ targetContainerId }" not found` );
	}

	return runCommandSync< V1Element >( 'document/elements/move', {
		container,
		target,
		options: { edit: false, ...options },
	} );
}
