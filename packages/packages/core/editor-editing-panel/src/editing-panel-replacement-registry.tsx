import { type ComponentType } from 'react';
import { type Element, type ElementType } from '@elementor/editor-elements';

type EditingPanelReplacement = {
	condition: ( element: Element, elementType: ElementType ) => boolean;
	component: ComponentType;

	// ordered from lowest to highest
	priority: number;
};

const registry = new Map< string, EditingPanelReplacement >();

const DEFAULT_PRIORITY = 10;

export const registerEditingPanelReplacement = ( {
	id,
	priority = DEFAULT_PRIORITY,
	...props
}: Omit< EditingPanelReplacement, 'priority' > & { id: string; priority?: number } ) => {
	registry.set( id, { ...props, priority } );
};

export const getEditingPanelReplacement = (
	element: Element,
	elementType: ElementType
): EditingPanelReplacement | null =>
	Array.from( registry.values() )
		.filter( ( { condition } ) => condition( element, elementType ) )
		.sort( ( a, b ) => a.priority - b.priority )?.[ 0 ] ?? null;
