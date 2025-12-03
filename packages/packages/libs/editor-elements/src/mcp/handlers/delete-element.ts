import { deleteElement } from '../../sync/delete-element';
import { getContainer } from '../../sync/get-container';

export function handleDeleteElement( elementId: string ): { success: boolean } {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	deleteElement( {
		elementId,
		options: { useHistory: true },
	} );

	return { success: true };
}
