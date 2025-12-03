import { duplicateElement } from '../../sync/duplicate-element';
import { getContainer } from '../../sync/get-container';

export function handleDuplicateElement( elementId: string ): { elementId: string; type: string } {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	const duplicatedElement = duplicateElement( {
		elementId,
		options: { useHistory: true },
	} );

	const type = duplicatedElement.model.get( 'widgetType' ) || duplicatedElement.model.get( 'elType' ) || '';

	return {
		elementId: duplicatedElement.id,
		type,
	};
}
