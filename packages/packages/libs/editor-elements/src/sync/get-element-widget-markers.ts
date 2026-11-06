import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type V1ElementWidgetMarker } from './types';

export function getElementWidgetMarker( elementId: ElementID ): V1ElementWidgetMarker | null {
	const widget = getContainer( elementId )?.model.get( 'widget' );

	if ( ! widget ) {
		return null;
	}

	return { ...widget, values: normalizeValues( widget.values ) };
}

export function getElementPart( elementId: ElementID ): string | null {
	return getContainer( elementId )?.model.get( 'part' ) ?? null;
}

function normalizeValues( values: unknown ): Record< string, unknown > {
	const isPlainObject = !! values && typeof values === 'object' && ! Array.isArray( values );

	return isPlainObject ? ( values as Record< string, unknown > ) : {};
}
