import * as React from 'react';
import { PropKeyProvider, PropProvider, type SetValue, useBoundProp } from '@elementor/editor-controls';
import { isDependency, isDependencyMet, type PropKey, type PropType } from '@elementor/editor-props';

import { createTopLevelObjectType } from '../controls-registry/create-top-level-object-type';
import { useDynamicTag } from './hooks/use-dynamic-tag';
import { dynamicPropTypeUtil, type DynamicPropValue } from './utils';

type DynamicControlProps = React.PropsWithChildren< {
	bind: PropKey;
} >;

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

const DynamicConditionalControl: React.FC< DynamicConditionalControlProps > = ( {
	children,
	propType,
	dynamicSettings = {}
} ) => {
	const dependencyKeys = getDynamicDependencies( propType );

	if ( ! dependencyKeys.length ) {
		return <>{ children }</>;
	}

	// Get dependency values from dynamic settings
	const dependencyValues = dependencyKeys.reduce( ( acc, key ) => {
			acc[ key ] = dynamicSettings[ key ];

			return acc;
		},
		{} as Record< string, DynamicPropValue >
	);

	const isHidden = ! isDependencyMet( propType?.dependencies, dependencyValues );

	return isHidden ? null : <>{ children }</>;
};

export const DynamicControl = ( { bind, children }: DynamicControlProps ) => {
	const { value, setValue } = useBoundProp( dynamicPropTypeUtil );
	const { name = '', settings } = value ?? {};

	const dynamicTag = useDynamicTag( name );

	if ( ! dynamicTag ) {
		throw new Error( `Dynamic tag ${ name } not found` );
	}

	const dynamicPropType = dynamicTag.props_schema[ bind ];

	const defaultValue = dynamicPropType?.default;
	const dynamicValue = settings?.[ bind ] ?? defaultValue;

	const setDynamicValue: SetValue< Record< string, DynamicPropValue > > = ( newValues ) => {
		setValue( {
			name,
			settings: {
				...settings,
				...newValues,
			},
		} );
	};

	const propType = createTopLevelObjectType( { schema: dynamicTag.props_schema } );

	return (
		<PropProvider propType={ propType } setValue={ setDynamicValue } value={ { [ bind ]: dynamicValue } }>
			<PropKeyProvider bind={ bind }>
				<DynamicConditionalControl propType={ dynamicPropType } dynamicSettings={ settings }>
					{ children }
				</DynamicConditionalControl>
			</PropKeyProvider>
		</PropProvider>
	);
};
