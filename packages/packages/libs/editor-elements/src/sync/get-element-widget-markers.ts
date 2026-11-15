import { z } from '@elementor/schema';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type V1Element, type V1ElementWidgetMarker } from './types';

const WIDGET_ID_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+$/;
const PART_PATTERN = /^[a-z][a-z0-9_]*$/;
const MIN_VERSION = 1;

export const WIDGET_MARKER_KEYS = {
	widget: 'widget',
	part: 'part',
	slot: 'slot',
} as const;

const widgetMarkerSchema = z.object( {
	id: z.string().regex( WIDGET_ID_PATTERN ),
	version: z.number().int().min( MIN_VERSION ),
	values: z.record( z.unknown() ).optional(),
} );

const partSchema = z.string().regex( PART_PATTERN );

export function getContainerWidgetMarker( container: V1Element | null ): Required< V1ElementWidgetMarker > | null {
	const result = widgetMarkerSchema.safeParse( container?.model.get( WIDGET_MARKER_KEYS.widget ) );

	if ( ! result.success ) {
		return null;
	}

	return { ...result.data, values: result.data.values ?? {} };
}

export function getContainerPart( container: V1Element | null ): string | null {
	const result = partSchema.safeParse( container?.model.get( WIDGET_MARKER_KEYS.part ) );

	return result.success ? result.data : null;
}

export function isContainerSlot( container: V1Element | null ): boolean {
	return true === container?.model.get( WIDGET_MARKER_KEYS.slot ) && null !== getContainerPart( container );
}

export function getElementWidgetMarker( elementId: ElementID ): Required< V1ElementWidgetMarker > | null {
	return getContainerWidgetMarker( getContainer( elementId ) );
}

export function getElementPart( elementId: ElementID ): string | null {
	return getContainerPart( getContainer( elementId ) );
}
