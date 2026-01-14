import * as React from 'react';
import { isDependencyMet, type PropsSchema, type PropType, type PropValue } from '@elementor/editor-props';

import { type DynamicPropValue } from '../types';

type DynamicConditionalControlProps = React.PropsWithChildren< {
	propType?: PropType;
	propsSchema?: PropsSchema;
	dynamicSettings?: Record< string, DynamicPropValue >;
} >;

export const DynamicConditionalControl: React.FC< DynamicConditionalControlProps > = ( {
	children,
	propType,
	propsSchema,
	dynamicSettings,
} ) => {
	const defaults = React.useMemo< Record< string, PropValue | null > >( () => {
		if ( ! propsSchema ) {
			return {};
		}

		const entries = Object.entries( propsSchema ) as Array< [ string, PropType ] >;
		return entries.reduce< Record< string, PropValue | null > >( ( result, [ key, prop ] ) => {
			result[ key ] = prop?.default ?? null;
			return result;
		}, {} );
	}, [ propsSchema ] );

	const convertedSettings = React.useMemo( () => {
		if ( ! dynamicSettings ) {
			return {};
		}

		return Object.entries( dynamicSettings ).reduce< Record< string, PropValue > >(
			( result, [ key, dynamicValue ] ) => {
				if ( dynamicValue && typeof dynamicValue === 'object' && '$$type' in dynamicValue ) {
					result[ key ] = dynamicValue as PropValue;
				} else {
					result[ key ] = {
						$$type: 'plain',
						value: dynamicValue,
					} as PropValue;
				}
				return result;
			},
			{}
		);
	}, [ dynamicSettings ] );

	const effectiveSettings = React.useMemo( () => {
		return { ...defaults, ...convertedSettings } as Record< string, PropValue >;
	}, [ defaults, convertedSettings ] );

	if ( ! propType?.dependencies?.terms.length ) {
		return <>{ children }</>;
	}

	const isHidden = ! isDependencyMet( propType?.dependencies, effectiveSettings ).isMet;

	return isHidden ? null : <>{ children }</>;
};
