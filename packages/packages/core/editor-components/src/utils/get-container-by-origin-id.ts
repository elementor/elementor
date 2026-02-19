import { getContainer, type V1Element } from '@elementor/editor-elements';

import { type ExtendedWindow } from '../types';

/**
 * Resolves a container by its origin ID, with optional scoping to a component instance.
 *
 * When component instances are rendered, their inner elements get prefixed IDs
 * (e.g., `{instanceId}_{originalId}`), but store data uses original IDs.
 * This function bridges between the two by searching for elements with a matching `originId`.
 *
 * @param originElementId   - The original (unprefixed) element ID from store data
 * @param instanceElementId - Optional instance widget ID to scope the search
 *
 * @return The container with prefixed runtime ID, or null if not found
 *
 * @example
 * // Component editing mode (no prefixing)
 * getContainerByOriginId('element-1') // returns container with id='element-1'
 *
 * @example
 * // Instance editing mode (with hash prefixing)
 * getContainerByOriginId('element-1', 'instance-abc')
 * // returns container with id='{hash}_element-1' and originId='element-1'
 */
export function getContainerByOriginId( originElementId: string, instanceElementId?: string ): V1Element | null {
	if ( ! instanceElementId ) {
		return getContainer( originElementId );
	}

	const instanceContainer = getContainer( instanceElementId );

	if ( ! instanceContainer ) {
		return null;
	}

	const legacyWindow = window as unknown as ExtendedWindow;

	return (
		legacyWindow.elementor?.getContainerByKeyValue?.( {
			key: 'originId',
			value: originElementId,
			parent: instanceContainer.view,
		} ) ?? null
	);
}
