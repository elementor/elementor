import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { isDependency, isDependencyMet, type PropKey, type PropType, type PropValue } from '@elementor/editor-props';

import { useInheritedValues } from '../contexts/styles-inheritance-context';
import { useStylesFields } from '../hooks/use-styles-fields';

type DepValues = Record< string, PropValue > | null;

export const ConditionalField: FC< { children: ReactNode } > = ( { children } ) => {
	const { propType, value, resetValue } = useBoundProp();

	const depList = getDependencies( propType );

	const { values: depValues, setValues: setDepValues } = useStylesFields( depList );
	const inheritedValues = useInheritedValues( depList );

	const resolvedValues = resolveWithInherited( depValues, inheritedValues );
	const isHidden = ! isDependencyMet( propType?.dependencies, resolvedValues ).isMet;

	useSyncDepsWithInherited( { isHidden, depValues, value, inheritedValues, setDepValues, resetValue } );

	return isHidden ? null : children;
};

function useSyncDepsWithInherited( {
	isHidden,
	depValues,
	value,
	inheritedValues,
	setDepValues,
	resetValue,
}: {
	isHidden: boolean;
	depValues: DepValues;
	value: PropValue;
	inheritedValues: Record< string, PropValue >;
	setDepValues: ( props: Record< string, PropValue >, options: { history: { propDisplayName: string } } ) => void;
	resetValue: () => void;
} ) {
	const syncRef = useRef( { hasSynced: false, prevDepValues: depValues } );

	useEffect( () => {
		const { hasSynced, prevDepValues } = syncRef.current;

		if ( isHidden || ! value || ! depValues ) {
			syncRef.current = { hasSynced: false, prevDepValues: depValues };
			return;
		}

		if ( hasSynced ) {
			const wasCleared =
				prevDepValues &&
				Object.keys( prevDepValues ).some( ( key ) => prevDepValues[ key ] && ! depValues[ key ] );

			syncRef.current.prevDepValues = depValues;

			if ( wasCleared ) {
				resetValue();
			}

			return;
		}

		syncRef.current = { hasSynced: true, prevDepValues: depValues };

		Object.entries( depValues ).forEach( ( [ key, depValue ] ) => {
			const inherited = inheritedValues[ key ];

			if ( ! depValue && inherited ) {
				setDepValues( { [ key ]: inherited }, { history: { propDisplayName: key } } );
			}
		} );
	} );
}

function resolveWithInherited( localValues: DepValues, inheritedValues: Record< string, PropValue > ): DepValues {
	if ( ! localValues ) {
		return null;
	}

	return Object.fromEntries(
		Object.entries( localValues ).map( ( [ key, val ] ) => [ key, val ?? inheritedValues[ key ] ?? null ] )
	);
}

export function getDependencies( propType?: PropType ): PropKey[] {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
}
