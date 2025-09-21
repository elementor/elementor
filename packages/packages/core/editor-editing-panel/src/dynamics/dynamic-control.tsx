import * as React from 'react';
import { PropKeyProvider, PropProvider, type SetValue, useBoundProp } from '@elementor/editor-controls';
import { isDependencyMet, type PropKey, type PropType, type PropValue } from '@elementor/editor-props';

import { createTopLevelObjectType } from '../controls-registry/create-top-level-object-type';
import { useDynamicTag } from './hooks/use-dynamic-tag';
import { dynamicPropTypeUtil, type DynamicPropValue } from './utils';

type DynamicControlProps = React.PropsWithChildren< {
	bind: PropKey;
} >;

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

	const defaults = React.useMemo< Record< string, PropValue | null > >( () => {
		const entries = Object.entries( dynamicTag.props_schema ?? {} ) as Array< [ string, PropType ] >;
		return entries.reduce< Record< string, PropValue | null > >( ( result, [ key, prop ] ) => {
			result[ key ] = prop?.default ?? null;
			return result;
		}, {} );
	}, [ dynamicTag.props_schema ] );

	const effectiveSettings = { ...defaults, ...( settings ?? {} ) } as Record< string, DynamicPropValue >;

	const isHidden = ! isDependencyMet( dynamicPropType?.dependencies, effectiveSettings ).isMet;

	if ( isHidden ) {
		return null;
	}

	return (
		<PropProvider
			propType={ propType }
			setValue={ setDynamicValue }
			value={ { [ bind ]: dynamicValue } }
			isDisabled={ ( prop: PropType ) => ! isDependencyMet( prop?.dependencies, effectiveSettings ).isMet }
		>
			<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
		</PropProvider>
	);
};
