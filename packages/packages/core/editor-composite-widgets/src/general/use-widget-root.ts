import { type ElementID, getContainer, getContainerWidgetMarker, type V1Element } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';
import { type CompositeWidgetDefinition } from '../types';

type WidgetRoot = {
	root: V1Element;
	definition: CompositeWidgetDefinition;
};

// A move re-creates the container under the same id, through `document/elements/create`.
export function useWidgetRoot( elementId: ElementID ): WidgetRoot | null {
	return useListenTo( [ commandEndEvent( 'document/elements/create' ) ], () => getWidgetRoot( elementId ), [
		elementId,
	] );
}

function getWidgetRoot( elementId: ElementID ): WidgetRoot | null {
	const root = getContainer( elementId );
	const marker = getContainerWidgetMarker( root );
	const definition = marker ? getCompositeWidgetDefinition( marker.id ) : null;

	if ( ! root || ! definition ) {
		return null;
	}

	return { root, definition };
}
