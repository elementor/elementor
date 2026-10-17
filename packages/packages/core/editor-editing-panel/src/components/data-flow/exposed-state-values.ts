import { type ElementStateParam, type ElementStatePropType } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';

export const MAX_EXPOSED_CONTROLS = 5;

const OBJECT_PROP_TYPES: ElementStatePropType[] = [ 'size', 'image' ];

const SIZE_UNITS = [ 'px', 'em', 'rem', '%', 'vw', 'vh' ];

const TYPED_KEY_BY_PROP_TYPE: Partial< Record< ElementStatePropType, string > > = {
	string: 'string',
	enum: 'string',
	number: 'number',
	boolean: 'boolean',
	color: 'color',
	size: 'size',
	image: 'image',
};

const EMPTY_VALUE_BY_PROP_TYPE: Partial< Record< ElementStatePropType, unknown > > = {
	string: '',
	number: 0,
	boolean: false,
	color: '',
};

type TypedValue = { $$type: string; value: unknown };

export function getExposedParams( params: ElementStateParam[] ): ElementStateParam[] {
	return params.filter( ( param ) => !! param.exposed ).slice( 0, MAX_EXPOSED_CONTROLS );
}

export function toControlValue( param: ElementStateParam ): TypedValue | null {
	if ( param.default === null || param.default === undefined ) {
		return null;
	}

	if ( isObjectParam( param ) ) {
		return param.default as TypedValue;
	}

	return { $$type: getTypedKey( param ), value: param.default };
}

export function fromControlValue( param: ElementStateParam, controlValue: TypedValue | null ): unknown {
	if ( isObjectParam( param ) ) {
		return controlValue;
	}

	return controlValue?.value ?? getEmptyValue( param );
}

export function toPropType( param: ElementStateParam ): PropType {
	const key = getTypedKey( param );

	return {
		key,
		kind: isObjectParam( param ) ? 'object' : 'plain',
		meta: {},
		default: null,
		initial_value: null,
		settings: getSettings( param ),
		dependencies: null,
		...( isObjectParam( param ) ? { shape: {} } : {} ),
	} as unknown as PropType;
}

function getSettings( param: ElementStateParam ): Record< string, unknown > {
	if ( param.prop_type === 'enum' ) {
		return { enum: param.options ?? [] };
	}

	if ( param.prop_type === 'size' ) {
		return { available_units: SIZE_UNITS };
	}

	return {};
}

function getEmptyValue( param: ElementStateParam ): unknown {
	return EMPTY_VALUE_BY_PROP_TYPE[ param.prop_type ?? 'string' ] ?? '';
}

function getTypedKey( param: ElementStateParam ): string {
	return TYPED_KEY_BY_PROP_TYPE[ param.prop_type ?? 'string' ] ?? 'string';
}

function isObjectParam( param: ElementStateParam ): boolean {
	return OBJECT_PROP_TYPES.includes( param.prop_type ?? 'string' );
}
