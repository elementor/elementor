import { useBoundProp } from '@elementor/editor-controls';
import { isDependency, type PropKey, type PropType } from '@elementor/editor-props';

import { useStylesFields } from '../hooks/use-styles-fields';
import { getHiddenState } from './get-dependency-state';

export const ConditionalField: React.FC< {
	children: React.ReactNode;
} > = ( { children } ) => {
	const { propType } = useBoundProp();

	const depList = getDependencies( propType );

	const { values: depValues } = useStylesFields( depList );

	const isHidden = getHiddenState( propType, depValues );

	return isHidden ? null : children;
};

export function getDependencies( propType?: PropType ): PropKey[] {
	const propTypeDependencies = propType?.dependencies || [];

	if ( ! propTypeDependencies.length ) {
		return [];
	}

	const dependenciesPaths = propTypeDependencies.flatMap( ( dep ) =>
		dep.terms.flatMap( ( term ) => {
			if ( ! isDependency( term ) ) {
				return term.path;
			}

			return [];
		} )
	);

	return dependenciesPaths;
}
