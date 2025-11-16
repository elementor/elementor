import { getContainer } from '../../sync/get-container';
import { moveElement } from '../../sync/move-element';

export function handleMoveElement( {
	elementId,
	targetContainerId,
}: {
	elementId: string;
	targetContainerId: string;
} ): { success: boolean } {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	const targetContainer = getContainer( targetContainerId );

	if ( ! targetContainer ) {
		throw new Error( `Target container with ID "${ targetContainerId }" not found` );
	}

	moveElement( {
		elementId,
		targetContainerId,
		options: { useHistory: true },
	} );

	return { success: true };
}
