import { getAllDescendants, getContainerPart, type V1Element } from '@elementor/editor-elements';

import { findLockingWidgetRoot } from '../closed-structure/find-locking-widget-root';

export function findWidgetPart( root: V1Element, part: string ): V1Element | null {
	return findWidgetParts( root, part )[ 0 ] ?? null;
}

export function findWidgetParts( root: V1Element, part: string ): V1Element[] {
	return getAllDescendants( root ).filter(
		( element ) => getContainerPart( element ) === part && isInWidgetStructure( element, root )
	);
}

function isInWidgetStructure( element: V1Element, root: V1Element ): boolean {
	return element === root || findLockingWidgetRoot( element.parent ) === root;
}
