import { type V1ElementData } from '@elementor/editor-elements';

import { generateShortHash } from './hash-string';

/**
 * Prefixes element IDs with a hashed instance identifier.
 *
 * Instead of concatenating the full prefix (which can become very long with nested components),
 * this function hashes the prefix to create a short, deterministic identifier.
 *
 * @param elements - Array of elements to process
 * @param prefix - Instance ID or chain of instance IDs (e.g., "inst-a" or "inst-a_inst-b")
 * @returns New array with prefixed IDs and originId fields
 *
 * @example
 * // Single instance:
 * prefixElementIds([{id: 'btn-1'}], 'instance-abc')
 * // -> [{id: '2g4kx7a_btn-1', originId: 'btn-1'}]
 *
 * @example
 * // Nested instances (same length!):
 * prefixElementIds([{id: 'btn-1'}], 'inst-a_inst-b_inst-c')
 * // -> [{id: 'k9m3xa2_btn-1', originId: 'btn-1'}]
 */
export function prefixElementIds( elements: V1ElementData[], prefix: string ): V1ElementData[] {
	const shortPrefix = generateShortHash( prefix, 7 );

	return elements.map( ( element ) => ( {
		...element,
		id: `${ shortPrefix }_${ element.id }`,
		originId: element.id,
		elements: element.elements ? prefixElementIds( element.elements, prefix ) : undefined,
	} ) );
}
