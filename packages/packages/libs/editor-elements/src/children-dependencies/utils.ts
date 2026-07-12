import { type Dependency, isDependencyMet, type PropValue } from '@elementor/editor-props';

import { generateElementId } from '../sync/generate-element-id';
import { type V1ElementData } from '../sync/types';

export function evaluateWhen( when: Dependency | undefined, settings: Record< string, PropValue > ): boolean {
	return isDependencyMet( when, settings ).isMet;
}

export function ensureModelId( model: V1ElementData ): V1ElementData {
	const { skipDefaultChildren: _skipDefaultChildren, ...rest } = model;

	return rest.id ? rest : { ...rest, id: generateElementId() };
}
