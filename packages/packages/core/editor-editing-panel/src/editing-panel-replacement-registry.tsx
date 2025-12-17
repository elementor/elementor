import { type ComponentType } from 'react';
import { type Element, type ElementType } from '@elementor/editor-elements';

type EditingPanelReplacement = {
	condition: ( element: Element | null, elementType: ElementType | null ) => boolean;
	component: ComponentType;

	// ordered from lowest to highest
	priority: number;
};

type RegistryListener = () => void;

const registry = new Map< string, EditingPanelReplacement >();
const listeners = new Set< RegistryListener >();

const DEFAULT_PRIORITY = 10;

export const subscribeToEditingPanelReplacementRegistry = ( listener: RegistryListener ) => {
	listeners.add( listener );

	return () => {
		listeners.delete( listener );
	};
};

export const notifyEditingPanelReplacementRegistryChanged = () => {
	listeners.forEach( ( listener ) => listener() );
};

export const registerEditingPanelReplacement = ( {
	id,
	priority = DEFAULT_PRIORITY,
	...props
}: Omit< EditingPanelReplacement, 'priority' > & { id: string; priority?: number } ) => {
	registry.set( id, { ...props, priority } );
	notifyEditingPanelReplacementRegistryChanged();
};

export const getEditingPanelReplacement = (
	element: Element | null,
	elementType: ElementType | null
): EditingPanelReplacement | null =>
	Array.from( registry.values() )
		.filter( ( { condition } ) => condition( element, elementType ) )
		.sort( ( a, b ) => a.priority - b.priority )?.[ 0 ] ?? null;
