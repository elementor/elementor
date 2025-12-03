import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getContainer } from '../../sync/get-container';

export function handleDeselectElement( elementId: string ): { success: boolean } {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	runCommand( 'document/elements/deselect', { container } );

	return { success: true };
}

export function handleDeselectAllElements(): { success: boolean } {
	runCommand( 'document/elements/deselect-all', {} );

	return { success: true };
}
