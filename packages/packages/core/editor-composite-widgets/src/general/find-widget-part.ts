import { getAllDescendants, getContainerPart, type V1Element } from '@elementor/editor-elements';

import { findLockingWidgetRoot } from '../closed-structure/find-locking-widget-root';

export function findWidgetPart( root: V1Element, part: string ): V1Element | null {
	return (
		getAllDescendants( root ).find(
			( element ) => getContainerPart( element ) === part && isInWidgetStructure( element, root )
		) ?? null
	);
}

function isInWidgetStructure( element: V1Element, root: V1Element ): boolean {
	return element === root || findLockingWidgetRoot( element.parent ) === root;
}
