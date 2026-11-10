import { z } from '@elementor/schema';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type V1ElementWidgetMarker } from './types';

const WIDGET_ID_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+$/;
const PART_PATTERN = /^[a-z][a-z0-9_]*$/;
const MIN_VERSION = 1;

const widgetMarkerSchema = z.object( {
	id: z.string().regex( WIDGET_ID_PATTERN ),
	version: z.number().int().min( MIN_VERSION ),
	values: z.record( z.unknown() ).optional(),
} );

const partSchema = z.string().regex( PART_PATTERN );

export function getElementWidgetMarker( elementId: ElementID ): Required< V1ElementWidgetMarker > | null {
	const result = widgetMarkerSchema.safeParse( getContainer( elementId )?.model.get( 'widget' ) );

	if ( ! result.success ) {
		return null;
	}

	return { ...result.data, values: result.data.values ?? {} };
}

export function getElementPart( elementId: ElementID ): string | null {
	const result = partSchema.safeParse( getContainer( elementId )?.model.get( 'part' ) );

	return result.success ? result.data : null;
}
