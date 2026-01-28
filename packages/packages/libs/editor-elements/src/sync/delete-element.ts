import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getRealContainer } from './get-container';
import { findModelWithParent } from './get-model';

type Options = {
	useHistory?: boolean;
	at?: number;
};

export function deleteElement( {
	elementId,
	options = {},
}: {
	elementId: string;
	options?: Options;
} ): Promise< void > {
	const container = getRealContainer( elementId );

	if ( container ) {
		return runCommand( 'document/elements/delete', {
			container,
			options,
		} );
	}

	return deleteElementViaModel( elementId );
}

function deleteElementViaModel( elementId: string ): Promise< void > {
	const result = findModelWithParent( elementId );

	if ( ! result ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	const { model, collection } = result;

	collection.remove( model );

	return Promise.resolve();
}
