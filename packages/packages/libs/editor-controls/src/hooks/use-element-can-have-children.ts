import { useMemo } from 'react';
import { getContainer, useSelectedElement } from '@elementor/editor-elements';

export const useElementCanHaveChildren = (): boolean => {
	const { element } = useSelectedElement();
	const elementId = element?.id || '';

	return useMemo( () => {
		const container = getContainer( elementId );

		if ( ! container ) {
			return false;
		}

		return container.model.get( 'elType' ) !== 'widget';
	}, [ elementId ] );
};
