import { type FC, type ReactNode } from 'react';
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

	useUpdateDepWithInherited( isHidden, depList, inheritedValues );

	return isHidden ? null : children;
};

const useUpdateDepWithInherited = (
	isHidden: boolean,
	depList: string[],
	inheritedValues: Record< string, PropValue >
) => {
	const { values: depValues, setValues: setDepValues } = useStylesFields( depList );
	const { value } = useBoundProp();

	if ( isHidden ) {
		return;
	}

	Object.entries( depValues ?? {} ).forEach( ( [ key, depValue ] ) => {
		if ( ! ( value && ! depValue ) ) {
			return;
		}

		setDepValues( { [ key ]: inheritedValues[ key ] }, { history: { propDisplayName: key } } );
	} );
};

function resolveWithInherited(
	values: Record< string, PropValue > | null,
	inheritedValues: Record< string, PropValue >
): Record< string, PropValue > | null {
	if ( ! values ) {
		return null;
	}

	return Object.fromEntries(
		Object.entries( values ).map( ( [ key, value ] ) => [ key, value ?? inheritedValues[ key ] ?? null ] )
	);
}

export function getDependencies( propType?: PropType ): PropKey[] {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
}
