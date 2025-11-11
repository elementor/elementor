import { getContainer, selectElement } from '../../sync/get-container';

export function handleSelectElement( elementId: string ): { success: boolean } {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	selectElement( elementId );

	return { success: true };
}

export function handleSelectMultipleElements( elementIds: string[] ): { success: boolean } {
	elementIds.forEach( ( elementId ) => {
		const container = getContainer( elementId );

		if ( container ) {
			selectElement( elementId );
		}
	} );

	return { success: true };
}
