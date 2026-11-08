import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type V1ElementWidgetMarker } from './types';

export function getElementWidgetMarker( elementId: ElementID ): Required< V1ElementWidgetMarker > | null {
	const widget = getContainer( elementId )?.model.get( 'widget' );

	if ( ! widget ) {
		return null;
	}

	return { ...widget, values: widget.values ?? {} };
}

export function getElementPart( elementId: ElementID ): string | null {
	return getContainer( elementId )?.model.get( 'part' ) ?? null;
}
