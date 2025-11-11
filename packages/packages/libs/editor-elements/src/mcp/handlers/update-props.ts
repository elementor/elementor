import { type Props } from '@elementor/editor-props';

import { getContainer } from '../../sync/get-container';
import { updateElementSettings } from '../../sync/update-element-settings';

export function handleUpdateProps( { elementId, props }: { elementId: string; props: Record< string, unknown > } ): {
	success: boolean;
} {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	updateElementSettings( {
		id: elementId,
		props: props as Props,
		withHistory: true,
	} );

	return { success: true };
}
