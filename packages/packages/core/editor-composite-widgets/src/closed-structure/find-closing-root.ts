import { getElementWidgetMarker, isElementSlot, type V1Element } from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';

type FindClosingRootOptions = {
	includeSelf: boolean;
};

export function findClosingRoot( element: V1Element, { includeSelf }: FindClosingRootOptions ): V1Element | null {
	let current = includeSelf ? element : element.parent;

	while ( current ) {
		if ( isElementSlot( current.id ) ) {
			return null;
		}

		if ( isRegisteredWidgetRoot( current ) ) {
			return current;
		}

		current = current.parent;
	}

	return null;
}

export function isClosedTarget( element: V1Element ): boolean {
	return null !== findClosingRoot( element, { includeSelf: true } );
}

export function isClosedElement( element: V1Element ): boolean {
	return null !== findClosingRoot( element, { includeSelf: false } );
}

function isRegisteredWidgetRoot( element: V1Element ): boolean {
	const marker = getElementWidgetMarker( element.id );

	return null !== marker && null !== getCompositeWidgetDefinition( marker.id );
}
