import { isEqual } from '@elementor/editor-editing-panel';
import { isTransformable, type PropValue, type TransformablePropValue } from '@elementor/editor-props';

type ObjectPropValue = TransformablePropValue< string, Record< string, unknown > >;

export function mergePresetValue( current: PropValue | undefined, preset: PropValue ): PropValue {
	if ( ! isObjectProp( preset ) || ! isObjectPropOfType( current, preset.$$type ) ) {
		return preset;
	}

	return { ...preset, value: { ...current.value, ...preset.value } };
}

export function matchesPresetValue( current: PropValue | undefined, preset: PropValue ): boolean {
	if ( ! isObjectProp( preset ) || ! isObjectPropOfType( current, preset.$$type ) ) {
		return isEqual( current, preset );
	}

	return Object.entries( preset.value ).every( ( [ key, value ] ) => isEqual( current.value[ key ], value ) );
}

function isObjectPropOfType( value: PropValue | undefined, type: string ): value is ObjectPropValue {
	return isObjectProp( value ) && value.$$type === type;
}

function isObjectProp( value: PropValue | undefined ): value is ObjectPropValue {
	return (
		isTransformable( value ) &&
		typeof value.value === 'object' &&
		value.value !== null &&
		! Array.isArray( value.value )
	);
}
