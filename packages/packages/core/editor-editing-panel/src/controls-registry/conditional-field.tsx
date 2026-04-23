import type { FC, ReactNode } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { isDependency, isDependencyMet, type PropKey, type PropType, type PropValue } from '@elementor/editor-props';

import { useInheritedValues } from '../contexts/styles-inheritance-context';
import { useStylesFields } from '../hooks/use-styles-fields';

export const ConditionalField: FC< {
	children: ReactNode;
} > = ( { children } ) => {
	const { propType } = useBoundProp();

	const depList = getDependencies( propType );

	const { values: depValues } = useStylesFields( depList );
	const inheritedValues = useInheritedValues( depList );

	const resolvedValues = resolveWithInherited( depValues, inheritedValues );

	const isHidden = ! isDependencyMet( propType?.dependencies, resolvedValues ).isMet;

	return isHidden ? null : children;
};

function resolveWithInherited(
	localValues: Record< string, PropValue > | null,
	inheritedValues: Record< string, PropValue >
): Record< string, PropValue > | null {
	if ( ! localValues ) {
		return null;
	}

	return Object.fromEntries(
		Object.entries( localValues ).map( ( [ key, value ] ) => [ key, value ?? inheritedValues[ key ] ?? null ] )
	);
}

export function getDependencies( propType?: PropType ): PropKey[] {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
}
