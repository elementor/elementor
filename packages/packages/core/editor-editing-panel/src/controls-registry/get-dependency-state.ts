import { isDependencyMet, type PropType, type PropValue } from '@elementor/editor-props';

export function isMeetingDependencies( propType: PropType, elementValues: PropValue ) {
	return propType?.dependencies?.terms.length ? ! isDependencyMet( propType?.dependencies, elementValues ) : true;
}
