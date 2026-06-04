import { type PropValue, type TransformablePropValue } from '../types';
import { isTransformable } from '../utils/is-transformable';

export const BIND_TO_KEY = 'bindTo';
export const ALLOW_BIND_KEY = 'allowBind';

export type DialectWireValue = TransformablePropValue< string, unknown > & {
	[ BIND_TO_KEY ]?: string;
	[ ALLOW_BIND_KEY ]?: boolean;
};

export const hasBindTo = ( value: PropValue ): value is DialectWireValue =>
	isTransformable( value ) && typeof ( value as DialectWireValue )[ BIND_TO_KEY ] === 'string';

export const stripDialectMarkers = ( value: PropValue ): PropValue => {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	const { [ BIND_TO_KEY ]: _bindTo, [ ALLOW_BIND_KEY ]: _allowBind, ...rest } = value as DialectWireValue;
	return rest as PropValue;
};

export const stripFallbackSetting = < T extends PropValue >( value: T ): T => {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	const inner = value.value as { settings?: Record< string, unknown > };
	const settings = inner?.settings;

	if ( ! settings || ! Object.hasOwn( settings, 'fallback' ) ) {
		return value;
	}

	const { fallback: _fallback, ...rest } = settings;

	return {
		...( value as TransformablePropValue< string, unknown > ),
		value: { ...inner, settings: rest },
	} as T;
};
