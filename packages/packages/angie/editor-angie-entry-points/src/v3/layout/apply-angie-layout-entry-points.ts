import type { AngieV3LayoutPromptContext } from '../../prompts';
import { shouldShowAngieEntryPoints } from '../is-angie-entry-points-enabled';
import { getCurrentDocumentType, type BehaviorsMap } from '../types';
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
	callback?: () => void;
};

type ContextMenuGroup = {
	name: string;
	actions: ContextMenuAction[];
};

export const ANGIE_LAYOUT_FILTER_PRIORITY = 20;

export function applyAngieAddSectionBehavior( behaviors: BehaviorsMap ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() || ! behaviors.ai ) {
		return behaviors;
	}

	const legacy = behaviors.ai as Record< string, unknown >;
	const legacyContext = legacy.context as { documentType?: string } | undefined;

	behaviors.ai = {
		...legacy,
		behaviorClass: getAngieAddSectionLayoutBehaviorClass(),
		layoutContext: {
			mode: 'new-layout',
			documentType: legacyContext?.documentType,
		} satisfies Partial< AngieV3LayoutPromptContext >,
	};

	return behaviors;
}

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

	const aiAction = saveGroup.actions.find( ( action ) => 'ai' === action.name );

	if ( ! aiAction ) {
		return groups;
	}

	aiAction.callback = () => {
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

	return groups;
}

export function applyAngieTemplateLibraryBehaviors( behaviors: BehaviorsMap ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() || ! behaviors.applyAiTemplate ) {
		return behaviors;
	}

	behaviors.applyAiTemplate = {
		...( behaviors.applyAiTemplate as Record< string, unknown > ),
		behaviorClass: getAngieTemplateLibraryBehaviorClass(),
	};

	return behaviors;
}
