import { getContainer } from '@elementor/editor-elements';

export const canElementHaveChildren = ( elementId: string ): boolean => {
	const container = getContainer( elementId );

	if ( ! container ) {
		return false;
	}

	return container.model.get( 'elType' ) !== 'widget';
};
