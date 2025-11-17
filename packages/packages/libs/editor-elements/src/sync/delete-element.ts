import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';

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
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	return runCommand( 'document/elements/delete', {
		container,
		options,
	} );
}
