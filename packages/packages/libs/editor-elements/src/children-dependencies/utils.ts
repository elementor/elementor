import { type Dependency, isDependencyMet, type PropValue } from '@elementor/editor-props';

import { generateElementId } from '../sync/generate-element-id';
import { type V1ElementData } from '../sync/types';
import { type ChildDependencyRule, type ChildrenStash } from './types';

export function evaluateWhen( when: Dependency | undefined, settings: Record< string, PropValue > ): boolean {
	return isDependencyMet( when, settings ).isMet;
}

export function ensureModelId( model: V1ElementData ): V1ElementData {
	const { skipDefaultChildren: _skipDefaultChildren, ...rest } = model;

	return rest.id ? rest : { ...rest, id: generateElementId() };
}

type ResolvedChildModel = {
	modelData: V1ElementData;
	wasStashed: boolean;
};

/**
 * Resolve the model to attach for a child-dependency rule, preferring a previously-stashed
 * (user-customized) model, then the rule's default, else a bare element.
 *
 * `default_model` and the bare fallback never carry an id, so they're run through
 * `ensureModelId` before the model reaches Backbone.
 *
 * @param elementId Parent element id, used as the stash lookup key.
 * @param rule      The child-dependency rule being resolved.
 * @param stash     Session-backed stash for previously-detached child models.
 */
export function resolveChildModelData(
	elementId: string,
	rule: ChildDependencyRule,
	stash: ChildrenStash
): ResolvedChildModel {
	const stashed = rule.stash ? stash.get( elementId, rule.child_type ) : undefined;
	const modelData = ensureModelId(
		stashed ?? rule.default_model ?? ( { elType: rule.child_type } as V1ElementData )
	);

	return { modelData, wasStashed: Boolean( stashed ) };
}
