import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';

export function deleteElement( { elementId }: { elementId: string } ): void {
	const container = getContainer( elementId );

	runCommand( 'document/elements/delete', {
		container,
	} );
}
