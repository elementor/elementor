import { type ExtendedWindow, TOP_LEVEL_SINGLE_SETTING_FILTER } from '@elementor/editor-elements';
import {
	type ArrayPropValue,
	createPropUtils,
	isTransformable,
	type ObjectPropValue,
	type PropType,
	type PropValue,
	type TransformablePropType,
} from '@elementor/editor-props';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { z } from '@elementor/schema';

import { getAtomicDynamicTags } from './sync/get-atomic-dynamic-tags';
import { type DynamicPropType, type DynamicPropValue, type DynamicTags } from './types';

const DYNAMIC_PROP_TYPE_KEY = 'dynamic';

const extendedWindow = window as unknown as ExtendedWindow;

export const dynamicPropTypeUtil = createPropUtils(
	DYNAMIC_PROP_TYPE_KEY,
	z.strictObject( {
		name: z.string(),
		group: z.string(),
		settings: z.any().optional(),
	} )
);

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
			( setting: PropValue | null ) => {
				return nestedDynamicSettingsFilter( setting, tags );
			}
		);
	} );
};

export const nestedDynamicSettingsFilter = ( value: PropValue | null, tags: DynamicTags ) => {
	if ( ! value ) {
		return null;
	}

	if ( isDynamicPropValue( value ) ) {
		return getFilteredDynamicSettings( value, tags );
	}

	if ( isObjectPropValue( value ) ) {
		return evaluateObjectPropValue( value, tags );
	}

	if ( isArrayPropValue( value ) ) {
		return evaluateArrayPropValue( value, tags );
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

const getFilteredDynamicSettings = ( value: PropValue, tags: DynamicTags ): PropValue | null => {
	if ( ! value || ! isTransformable( value ) || ! value?.value ) {
		return value;
	}

	if ( value?.$$type !== 'dynamic' ) {
		return value;
	}

	const dynamicValue = value.value as typeof value.value & { name: string };
	const tagName = tags[ dynamicValue.name ] ?? null;

	return tagName ? value : null;
};
