import * as React from 'react';
import { PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	getPropSchemaFromCache,
	type ObjectPropType,
	type ObjectPropValue,
	type Props,
	type PropType,
	type PropTypeUtil,
	type PropValue,
	type UnionPropType,
} from '@elementor/editor-props';

type TransformableObjectBridgeProps = React.PropsWithChildren;

export function TransformableObjectBridge( { children }: TransformableObjectBridgeProps ) {
	const { propType: parentPropType, value, setValue, isDisabled, placeholder, baseValue } =
		useBoundProp< ObjectPropValue, ObjectPropType >();

	const propTypeUtil = resolvePropTypeUtil( parentPropType, value );
	const objectPropType = resolveObjectPropType( parentPropType, propTypeUtil?.key ?? '' );
	const innerValue = ( propTypeUtil?.extract( value ) ?? extractInnerObjectValue( value ) ) as Props;

	const setInnerValue = ( next: Props, options?: Parameters< typeof setValue >[ 1 ], meta?: Parameters< typeof setValue >[ 2 ] ) => {
		if ( ! propTypeUtil ) {
			const envelopeTypeKey = objectPropType.key;
			setValue(
				{ $$type: envelopeTypeKey, value: next as ObjectPropValue[ 'value' ] },
				options,
				meta
			);
			return;
		}

		setValue( propTypeUtil.create( next as PropValue, { base: value ?? undefined } ), options, meta );
	};

	return (
		<PropProvider
			propType={ objectPropType }
			value={ innerValue }
			setValue={ setInnerValue }
			isDisabled={ isDisabled }
			placeholder={ placeholder }
			baseValue={ baseValue }
		>
			{ children }
		</PropProvider>
	);
}

function extractInnerObjectValue( value: ObjectPropValue | null ): Props {
	if ( value && typeof value === 'object' && '$$type' in value && 'value' in value && typeof value.value === 'object' ) {
		return ( value.value ?? {} ) as Props;
	}

	return ( value ?? {} ) as Props;
}

function resolvePropTypeUtil( parentPropType: PropType, value: ObjectPropValue | null ): PropTypeUtil< string, PropValue > | undefined {
	const typeKey =
		value && typeof value === 'object' && '$$type' in value && typeof value.$$type === 'string'
			? value.$$type
			: parentPropType.key;

	return getPropSchemaFromCache( typeKey );
}

function resolveObjectPropType( propType: PropType, typeKey: string ): ObjectPropType {
	if ( propType.kind === 'object' ) {
		return propType;
	}

	if ( propType.kind !== 'union' ) {
		throw new Error( `Bound section requires an object parent prop type, received "${ propType.kind }".` );
	}

	const unionPropType = propType as UnionPropType;
	const resolvedPropType =
		unionPropType.prop_types[ typeKey ] ??
		Object.values( unionPropType.prop_types ).find( ( candidate ) => candidate.kind === 'object' );

	if ( resolvedPropType?.kind !== 'object' ) {
		throw new Error( `Bound section could not resolve an object prop type for "${ typeKey }".` );
	}

	return resolvedPropType;
}
