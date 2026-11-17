import { useMemo } from 'react';
import { type ElementID, getContainer, getContainerWidgetMarker } from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';
import { type CompositeWidgetDefinition } from '../types';

export function useWidgetDefinition( elementId: ElementID ): CompositeWidgetDefinition | null {
	return useMemo( () => {
		const marker = getContainerWidgetMarker( getContainer( elementId ) );

		return marker ? getCompositeWidgetDefinition( marker.id ) : null;
	}, [ elementId ] );
}
