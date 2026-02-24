import { useMemo } from 'react';
import { getContainer } from '@elementor/editor-elements';

export const useElementCanHaveChildren = ( elementId: string ): boolean => {
	return useMemo( () => {
		const container = getContainer( elementId );

		if ( ! container ) {
			return false;
		}

		return container.model.get( 'elType' ) !== 'widget';
	}, [ elementId ] );
};
