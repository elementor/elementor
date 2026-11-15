import { type ComponentType } from 'react';
import { type Element, type ElementType } from '@elementor/editor-elements';

type EditingPanelReplacement = {
	condition: ( element: Element, elementType: ElementType ) => boolean;
	component: ComponentType;

	// ordered from lowest to highest
	priority: number;
};

type RegisterReplacementArgs = Omit< EditingPanelReplacement, 'priority' > & { id: string; priority?: number };

const DEFAULT_PRIORITY = 10;

function createReplacementRegistry() {
	const registry = new Map< string, EditingPanelReplacement >();

	const register = ( { id, priority = DEFAULT_PRIORITY, ...props }: RegisterReplacementArgs ) => {
		registry.set( id, { ...props, priority } );
	};

	const get = ( element: Element, elementType: ElementType ): EditingPanelReplacement | null =>
		Array.from( registry.values() )
			.filter( ( { condition } ) => condition( element, elementType ) )
			.sort( ( a, b ) => a.priority - b.priority )?.[ 0 ] ?? null;

	return { register, get };
}

const editingPanelReplacements = createReplacementRegistry();

const settingsTabReplacements = createReplacementRegistry();

export const registerEditingPanelReplacement = editingPanelReplacements.register;

export const getEditingPanelReplacement = editingPanelReplacements.get;

export const registerSettingsTabReplacement = settingsTabReplacements.register;

export const getSettingsTabReplacement = settingsTabReplacements.get;
