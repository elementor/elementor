import { type V1Element, WIDGET_MARKER_KEYS } from '@elementor/editor-elements';

// Definitions require a part on every node of the closed structure, so an element without markers is never inside one.
export function hasPart( element: V1Element ): boolean {
	return !! element.model.get( WIDGET_MARKER_KEYS.part );
}

export function hasWidgetMarkers( element: V1Element ): boolean {
	return hasPart( element ) || !! element.model.get( WIDGET_MARKER_KEYS.widget );
}
