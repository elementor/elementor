import {
	findClosestContainer,
	getContainerWidgetMarker,
	isContainerSlot,
	type V1Element,
} from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';

export function isInsertionLocked( target: V1Element ): boolean {
	return null !== findLockingWidgetRoot( target );
}

export function isElementLocked( element: V1Element ): boolean {
	return null !== findLockingWidgetRoot( element.parent );
}

export function findLockingWidgetRoot( start: V1Element | undefined ): V1Element | null {
	// Slot content is regular page content, outside the widget's closed structure.
	const boundary = findClosestContainer(
		start,
		( container ) => isContainerSlot( container ) || isRegisteredWidgetRoot( container )
	);

	return boundary && ! isContainerSlot( boundary ) ? boundary : null;
}

export function isRegisteredWidgetRoot( element: V1Element ): boolean {
	const marker = getContainerWidgetMarker( element );

	return null !== marker && null !== getCompositeWidgetDefinition( marker.id );
}
