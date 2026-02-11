import { getContainer, type V1Element } from '@elementor/editor-elements';

import { type ExtendedWindow } from '../types';

export function getContainerByOriginId( originElementId: string, instanceElementId?: string ): V1Element | null {
	if ( ! instanceElementId ) {
		return getContainer( originElementId );
	}

	const instanceContainer = getContainer( instanceElementId );

	if ( ! instanceContainer ) {
		return null;
	}

	const legacyWindow = window as unknown as ExtendedWindow;

	return (
		legacyWindow.elementor?.getContainerByKeyValue?.( {
			key: 'originId',
			value: originElementId,
			parent: instanceContainer.view,
		} ) ?? null
	);
}
