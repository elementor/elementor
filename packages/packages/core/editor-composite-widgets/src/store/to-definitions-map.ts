import { type CompositeWidgetDefinitions } from '../types';

// PHP encodes an empty associative array as `[]`.
export function toDefinitionsMap( data: CompositeWidgetDefinitions | [] | undefined ): CompositeWidgetDefinitions {
	return ! data || Array.isArray( data ) ? {} : data;
}
