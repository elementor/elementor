import { useBoundProp } from '@elementor/editor-controls';
import { isDependency, isDependencyMet, type PropKey, type PropType } from '@elementor/editor-props';

import { useStylesFields } from '../hooks/use-styles-fields';

export const ConditionalField: React.FC< {
	children: React.ReactNode;
} > = ( { children } ) => {
	const { propType } = useBoundProp();

	const depList = getDependencies( propType );

	const { values: depValues } = useStylesFields( depList );

	const isHidden = ! isDependencyMet( propType?.dependencies, depValues );

	return isHidden ? null : children;
};

export function getDependencies( propType?: PropType ): PropKey[] {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
}
