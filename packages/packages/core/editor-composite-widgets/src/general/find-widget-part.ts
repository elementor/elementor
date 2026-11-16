import { getContainerPart, isContainerSlot, type V1Element } from '@elementor/editor-elements';

export function findWidgetPart( container: V1Element, part: string ): V1Element | null {
	if ( getContainerPart( container ) === part ) {
		return container;
	}

	// Slot content is page content, outside the closed structure: a nested widget there reuses the same part names.
	if ( isContainerSlot( container ) ) {
		return null;
	}

	for ( const child of container.children ?? [] ) {
		const found = findWidgetPart( child, part );

		if ( found ) {
			return found;
		}
	}

	return null;
}
