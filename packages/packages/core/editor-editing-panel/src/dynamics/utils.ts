import { type ExtendedWindow, TOP_LEVEL_SINGLE_SETTING_FILTER } from '@elementor/editor-elements';
import {
	type ArrayPropValue,
	getFilteredDynamicSettings,
	isTransformable,
	type ObjectPropValue,
	type PropsSchema,
	type PropType,
	type PropValue,
	type TransformablePropType,
} from '@elementor/editor-props';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getAtomicDynamicTags } from './sync/get-atomic-dynamic-tags';
import { type DynamicPropType, type DynamicPropValue, type DynamicTags } from './types';

const DYNAMIC_PROP_TYPE_KEY = 'dynamic';

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

export const validateDynamicSettings = () => {
	listenTo( v1ReadyEvent(), () => {
		const tags = getAtomicDynamicTags()?.tags ?? {};

		extendedWindow.elementor?.hooks?.addFilter?.(
			TOP_LEVEL_SINGLE_SETTING_FILTER,
			( setting: PropsSchema[ string ] | null ) => {
				return nestedDynamicSettingsFilter( setting, tags );
			}
		);
	} );
};

export const nestedDynamicSettingsFilter = < T extends PropsSchema[ string ] | PropValue | null >(
	value: T,
	tags: DynamicTags
): T | null => {
	if ( ! value ) {
		return null;
	}

	if ( isDynamicPropValue( value ) ) {
		return getFilteredDynamicSettings( value ) as T;
	}

	if ( isObjectPropValue( value ) ) {
		return evaluateObjectPropValue( value, tags ) as T;
	}

	if ( isArrayPropValue( value ) ) {
		return evaluateArrayPropValue( value, tags ) as T;
	}

	return value ?? null;
};

const evaluateObjectPropValue = ( originalValue: ObjectPropValue, tags: DynamicTags ) => {
	const evaluatedValue = { ...originalValue.value };

	for ( const key in evaluatedValue ) {
		const innerValue = evaluatedValue[ key ];

		evaluatedValue[ key ] = nestedDynamicSettingsFilter( innerValue, tags );
	}

	return { ...originalValue, value: evaluatedValue };
};

const evaluateArrayPropValue = ( originalValue: ArrayPropValue, tags: DynamicTags ) => {
	const value = [ ...originalValue.value ];

	for ( let index = 0; index < value.length; index++ ) {
		const innerValue = value[ index ];

		value[ index ] = nestedDynamicSettingsFilter( innerValue, tags );
	}

	return { ...originalValue, value };
};

const isObjectPropValue = ( value: PropValue ): value is ObjectPropValue => {
	return isTransformable( value ) && typeof value.value === 'object' && ! Array.isArray( value.value );
};

const isArrayPropValue = ( value: PropValue ): value is ArrayPropValue => {
	return isTransformable( value ) && Array.isArray( value.value );
};
