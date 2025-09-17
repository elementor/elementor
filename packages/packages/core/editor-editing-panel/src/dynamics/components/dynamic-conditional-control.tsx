import * as React from 'react';
import { isDependency, isDependencyMet, type PropKey, type PropType } from '@elementor/editor-props';

import { type DynamicPropValue } from '../utils';

type DynamicConditionalControlProps = React.PropsWithChildren< {
	propType?: PropType;
	dynamicSettings?: Record< string, DynamicPropValue >;
} >;

const getDynamicDependencies = ( propType?: PropType ): PropKey[] => {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
};

export const DynamicConditionalControl: React.FC< DynamicConditionalControlProps > = ( {
	children,
	propType,
	dynamicSettings = {},
} ) => {
	const dependencyKeys = getDynamicDependencies( propType );

	if ( ! dependencyKeys.length ) {
		return <>{ children }</>;
	}

	// Get dependency values from dynamic settings
	const dependencyValues = dependencyKeys.reduce(
		( acc, key ) => {
			const dynamicValue = dynamicSettings[ key ];
			acc[ key ] = {
				$$type: dynamicValue?.$$type || 'plain',
				value: dynamicValue?.value
			};

			return acc;
		},
		{} as Record< string, DynamicPropValue >
	);

	const isHidden = ! isDependencyMet( propType?.dependencies, dependencyValues ).isMet;

	return isHidden ? null : <>{ children }</>;
};
