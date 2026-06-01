import { type SetValue, useBoundProp } from '@elementor/editor-controls';
import {
	isTransformable,
	type ObjectPropType,
	type ObjectPropValue,
	type Props,
	type PropType,
	type UnionPropType,
} from '@elementor/editor-props';

export function useTransformableObjectProp() {
	const {
		propType: parentPropType,
		value,
		setValue,
		...boundPropContext
	} = useBoundProp< ObjectPropValue, ObjectPropType >();

	const envelope = isTransformable( value ) ? value : null;
	const objectPropType = resolveObjectPropType( parentPropType, envelope?.$$type ?? '' );
	const envelopeTypeKey = envelope?.$$type ?? objectPropType.key;
	const innerValue = ( envelope?.value ?? {} ) as Props;

	const setInnerValue: SetValue< Props > = ( next, options, meta ) => {
		setValue( { $$type: envelopeTypeKey, value: next as ObjectPropValue[ 'value' ] }, options, meta );
	};

	return {
		...boundPropContext,
		propType: objectPropType,
		value: innerValue,
		setValue: setInnerValue,
		envelopeTypeKey,
	};
}

function resolveObjectPropType( propType: PropType, typeKey: string ): ObjectPropType {
	if ( propType.kind === 'object' ) {
		return propType;
	}

	if ( propType.kind !== 'union' ) {
		throw new Error( `Object section control requires an object parent prop type, received "${ propType.kind }".` );
	}

	const unionPropType = propType as UnionPropType;
	const resolvedPropType =
		unionPropType.prop_types[ typeKey ] ??
		Object.values( unionPropType.prop_types ).find( ( candidate ) => candidate.kind === 'object' );

	if ( resolvedPropType?.kind !== 'object' ) {
		throw new Error( `Object section control could not resolve an object prop type for "${ typeKey }".` );
	}

	return resolvedPropType;
}
