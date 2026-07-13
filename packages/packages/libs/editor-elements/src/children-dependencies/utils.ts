import { type Dependency, isDependencyMet, type PropValue } from '@elementor/editor-props';

export function evaluateWhen( when: Dependency | undefined, settings: Record< string, PropValue > ): boolean {
	return isDependencyMet( when, settings ).isMet;
}
