import { __ } from '@wordpress/i18n';

import type { AngieV3LayoutPromptContext } from '../../prompts';
import { shouldShowAngieEntryPoints } from '../is-angie-entry-points-enabled';
import { type BehaviorsMap, getCurrentDocumentType } from '../types';
import { getAngieAddSectionLayoutBehaviorClass } from './create-angie-layout-behavior';
import { getAngieTemplateLibraryBehaviorClass } from './create-angie-template-library-behavior';
import { openAngieForV3Layout } from './open-angie-layout';

type ContainerElementView = {
	getContainer: () => {
		id: string;
		model: { get: ( key: string ) => unknown };
		view: { _index: number };
		parent?: { id?: string };
		children?: { length: number };
	};
};

type ContextMenuAction = {
	name?: string;
	icon?: string;
	title?: string;
	isEnabled?: () => boolean;
	callback?: () => void;
};

type ContextMenuGroup = {
	name: string;
	actions: ContextMenuAction[];
};

type LibraryRoutes = {
	current?: {
		library?: string;
	};
};

export const ANGIE_LAYOUT_FILTER_PRIORITY = 20;

const CORE_INSERT_BUTTON_TEMPLATE = '#tmpl-elementor-template-library-insert-button';
const INSERT_AND_AI_VARIATIONS_TEMPLATE = '#tmpl-elementor-template-library-insert-and-ai-variations-buttons';
const BLOCKS_LIBRARY_ROUTE = 'library/templates/blocks';

/**
 * Injects (or replaces) the Build with AI button on the empty canvas add-section area.
 * Does not depend on legacy layout-module registering the behavior first.
 * @param behaviors
 */
export function applyAngieAddSectionBehavior( behaviors: BehaviorsMap ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() ) {
		return behaviors;
	}

	const legacy = ( behaviors.ai as Record< string, unknown > | undefined ) ?? {};
	const legacyContext = legacy.context as { documentType?: string } | undefined;

	behaviors.ai = {
		...legacy,
		behaviorClass: getAngieAddSectionLayoutBehaviorClass(),
		context: {
			documentType: legacyContext?.documentType ?? getCurrentDocumentType(),
		},
		layoutContext: {
			mode: 'new-layout',
			documentType: legacyContext?.documentType ?? getCurrentDocumentType(),
		} satisfies Partial< AngieV3LayoutPromptContext >,
	};

	return behaviors;
}

/**
 * Ensures the container context-menu has a Generate Variations action that opens Angie.
 * @param groups
 * @param currentElement
 */
export function applyAngieContainerContextMenu(
	groups: ContextMenuGroup[],
	currentElement: ContainerElementView
): ContextMenuGroup[] {
	if ( ! shouldShowAngieEntryPoints() ) {
		return groups;
	}

	const saveGroup = groups.find( ( group ) => 'save' === group.name );

	if ( ! saveGroup ) {
		return groups;
	}

	const openVariation = () => {
		const container = currentElement.getContainer();

		openAngieForV3Layout( {
			mode: 'container-variation',
			documentType: getCurrentDocumentType(),
			at: container.view._index,
			targetContainerId: container.id,
			parentContainerId: container.parent?.id,
			targetElementTitle: container.model.get( 'title' ) as string,
			replaceElementId: container.id,
		} );
	};

	const aiAction = saveGroup.actions.find( ( action ) => 'ai' === action.name );

	if ( aiAction ) {
		aiAction.callback = openVariation;
		return groups;
	}

	saveGroup.actions.unshift( {
		name: 'ai',
		icon: 'eicon-ai',
		title: __( 'Generate variations with AI', 'elementor' ),
		isEnabled: () => 0 !== ( currentElement.getContainer().children?.length ?? 0 ),
		callback: openVariation,
	} );

	return groups;
}

/**
 * Injects (or replaces) the template-library Generate Variations behavior.
 * @param behaviors
 */
export function applyAngieTemplateLibraryBehaviors( behaviors: BehaviorsMap ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() ) {
		return behaviors;
	}

	behaviors.applyAiTemplate = {
		...( ( behaviors.applyAiTemplate as Record< string, unknown > | undefined ) ?? {} ),
		behaviorClass: getAngieTemplateLibraryBehaviorClass(),
	};

	return behaviors;
}

/**
 * Switches the library insert button template to include Generate Variations on Blocks.
 * @param viewId
 */
export function filterLibraryActionButtonTemplate( viewId: string ): string {
	if ( ! shouldShowAngieEntryPoints() ) {
		return viewId;
	}

	if ( CORE_INSERT_BUTTON_TEMPLATE !== viewId ) {
		return viewId;
	}

	const libraryRoute = ( window as unknown as { $e?: { routes?: LibraryRoutes } } ).$e?.routes?.current?.library;

	if ( BLOCKS_LIBRARY_ROUTE !== libraryRoute ) {
		return viewId;
	}

	return INSERT_AND_AI_VARIATIONS_TEMPLATE;
}
