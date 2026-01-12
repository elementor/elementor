import { type ExtendedWindow, TOP_LEVEL_SINGLE_SETTING_FILTER } from '@elementor/editor-elements';
import {
	type ArrayPropValue,
	createPropUtils,
	isTransformable,
	normalizeDynamicSettings,
	type ObjectPropValue,
	type PropsSchema,
	type PropType,
	type PropValue,
	type TransformablePropType,
} from '@elementor/editor-props';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { z } from '@elementor/schema';

import { getAtomicDynamicTags } from './sync/get-atomic-dynamic-tags';
import { type DynamicPropType, type DynamicTags } from './types';

const DYNAMIC_PROP_TYPE_KEY = 'dynamic';

export const dynamicPropTypeUtil = createPropUtils(
	DYNAMIC_PROP_TYPE_KEY,
	z.strictObject( {
		name: z.string(),
		group: z.string(),
		settings: z.any().optional(),
	} )
);

export type DynamicPropValue = z.infer< typeof dynamicPropTypeUtil.schema >;

const extendedWindow = window as unknown as ExtendedWindow;

const isDynamicPropType = ( prop: TransformablePropType ): prop is DynamicPropType =>
	prop.key === DYNAMIC_PROP_TYPE_KEY;

export const getDynamicPropType = ( propType: PropType ): DynamicPropType | null => {
	const dynamicPropType = propType.kind === 'union' && propType.prop_types[ DYNAMIC_PROP_TYPE_KEY ];

	return dynamicPropType && isDynamicPropType( dynamicPropType ) ? dynamicPropType : null;
};

export const isDynamicPropValue = ( prop: PropValue ): prop is DynamicPropValue => {
	return isTransformable( prop ) && prop.$$type === DYNAMIC_PROP_TYPE_KEY;
};

export const supportsDynamic = ( propType: PropType ): boolean => {
	return !! getDynamicPropType( propType );
};

export const filterUnsupportedDynamicSettings = () => {
	listenTo( v1ReadyEvent(), () => {
		const tags = getAtomicDynamicTags()?.tags ?? {};

		extendedWindow.elementor?.hooks?.addFilter?.(
			TOP_LEVEL_SINGLE_SETTING_FILTER,
			( setting: PropsSchema[ string ] | null ) => {
				return getNormalizedDynamicSettings( setting, tags );
			}
		);
	} );
};

export const getNormalizedDynamicSettings = < T extends PropsSchema[ string ] | PropValue | null >(
	value: T,
	tags: DynamicTags
): T | null => {
	if ( ! value ) {
		return null;
	}

	if ( isDynamicPropValue( value ) ) {
		return normalizeDynamicSettings( value ) as T;
	}

	if ( isObjectPropValue( value ) ) {
		return evaluateObjectPropValue( value, tags ) as T;
	}

	if ( isArrayPropValue( value ) ) {
		return evaluateArrayPropValue( value, tags ) as T;
	}

	return value ?? null;
};

const evaluateObjectPropValue = ( objectValue: ObjectPropValue, tags: DynamicTags ) => {
	const value = { ...objectValue.value };

	for ( const key in value ) {
		const innerValue = value[ key ];

		value[ key ] = getNormalizedDynamicSettings( innerValue, tags );
	}

	return { ...objectValue, value };
};

const evaluateArrayPropValue = ( arrayValue: ArrayPropValue, tags: DynamicTags ) => {
	const value = [ ...arrayValue.value ];

	for ( let index = 0; index < value.length; index++ ) {
		const innerValue = value[ index ];

		value[ index ] = getNormalizedDynamicSettings( innerValue, tags );
	}

	return { ...arrayValue, value };
};

const isObjectPropValue = ( value: PropValue ): value is ObjectPropValue => {
	return isTransformable( value ) && typeof value.value === 'object' && ! Array.isArray( value.value );
};

const isArrayPropValue = ( value: PropValue ): value is ArrayPropValue => {
	return isTransformable( value ) && Array.isArray( value.value );
};
