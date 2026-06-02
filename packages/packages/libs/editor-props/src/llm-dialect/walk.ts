import { type ObjectPropType, type PropType, type PropValue, type TransformablePropValue } from '../types';
import { isTransformable } from '../utils/is-transformable';
import { getArrayItemPropType, resolveUnionBranch } from './prop-type-nav';
import { applyLlmDialectPropValue } from './registry';
import { isLlmDialectSkip } from './skip';

type WalkContext = {
	suppressNestedBindTo: boolean;
};

type WalkDirection = 'toProp' | 'toDialect';

const defaultWalkContext: WalkContext = {
	suppressNestedBindTo: false,
};

const resolveDescentPropType = ( propType: PropType, value: { $$type: string } ): PropType => {
	if ( propType.kind !== 'union' ) {
		return propType;
	}

	return resolveUnionBranch( propType, value.$$type ) ?? propType;
};

const hasDirectBindTo = ( value: PropValue ): boolean =>
	isTransformable( value ) && typeof ( value as Record< string, unknown > ).bindTo === 'string';

const stripNestedBindToMarkers = ( value: PropValue ): PropValue => {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	const nextValue = { ...( value as Record< string, unknown > ) };
	delete nextValue.bindTo;
	delete nextValue.allowBind;

	if ( typeof value.value === 'object' && value.value !== null && ! Array.isArray( value.value ) ) {
		nextValue.value = Object.fromEntries(
			Object.entries( value.value as Record< string, PropValue > ).map( ( [ key, childValue ] ) => [
				key,
				stripNestedBindToMarkers( childValue ),
			] )
		);
	}

	return nextValue as PropValue;
};

const walkObjectChildren = (
	value: TransformablePropValue< string, Record< string, PropValue > >,
	propType: ObjectPropType,
	direction: WalkDirection,
	walkContext: WalkContext
): TransformablePropValue< string, Record< string, PropValue > > => {
	const shape = propType.shape ?? {};
	const nextValue = { ...value.value };
	const childSuppressNestedBindTo = walkContext.suppressNestedBindTo || hasDirectBindTo( value );

	for ( const [ key, childPropType ] of Object.entries( shape ) ) {
		if ( ! Object.hasOwn( nextValue, key ) ) {
			continue;
		}

		const walkedChild = walkPropValueWithPropType( nextValue[ key ], childPropType, direction, {
			suppressNestedBindTo: childSuppressNestedBindTo,
		} );

		if ( ! isLlmDialectSkip( walkedChild ) ) {
			nextValue[ key ] = walkedChild;
		}
	}

	return {
		...value,
		value: nextValue,
	};
};

const walkArrayChildren = (
	value: TransformablePropValue< string, PropValue[] >,
	propType: PropType,
	direction: WalkDirection,
	walkContext: WalkContext
): TransformablePropValue< string, PropValue[] > => {
	const itemPropType = getArrayItemPropType( propType );

	if ( ! itemPropType ) {
		return value;
	}

	return {
		...value,
		value: value.value.map( ( item ) => {
			const walkedItem = walkPropValueWithPropType( item, itemPropType, direction, walkContext );
			return isLlmDialectSkip( walkedItem ) ? item : walkedItem;
		} ),
	};
};

const applyNodeAdapters = (
	value: PropValue,
	propType: PropType,
	direction: WalkDirection,
	walkContext: WalkContext
): PropValue => {
	if ( direction === 'toProp' && hasDirectBindTo( value ) && walkContext.suppressNestedBindTo ) {
		return stripNestedBindToMarkers( value );
	}

	const converted = applyLlmDialectPropValue( value, { propType }, direction );
	return isLlmDialectSkip( converted ) ? value : converted;
};

export const walkPropValueWithPropType = (
	value: PropValue,
	propType: PropType | undefined,
	direction: WalkDirection,
	walkContext: WalkContext = defaultWalkContext
): PropValue => {
	if ( ! propType || ! isTransformable( value ) ) {
		return value;
	}

	const descentPropType = resolveDescentPropType( propType, value );
	let walkedValue = value as TransformablePropValue< string, unknown >;

	if ( descentPropType.kind === 'object' && typeof walkedValue.value === 'object' && walkedValue.value !== null ) {
		walkedValue = walkObjectChildren(
			walkedValue as TransformablePropValue< string, Record< string, PropValue > >,
			descentPropType,
			direction,
			walkContext
		);
	} else if ( descentPropType.kind === 'array' && Array.isArray( walkedValue.value ) ) {
		walkedValue = walkArrayChildren(
			walkedValue as TransformablePropValue< string, PropValue[] >,
			descentPropType,
			direction,
			walkContext
		);
	}

	return applyNodeAdapters( walkedValue, propType, direction, walkContext );
};
