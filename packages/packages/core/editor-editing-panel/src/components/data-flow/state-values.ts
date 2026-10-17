import { type ElementStateParamType } from '@elementor/editor-elements';

export const STATE_PARAM_TYPES: ElementStateParamType[] = [ 'string', 'number', 'boolean', 'json' ];

const STATE_BINDING_PATTERN = /^\{\{\s*state\.[\w.]+\s*\}\}$/;

const BOOLEAN_INPUTS: Record< string, boolean > = { true: true, false: false };

export function parseStateInput( input: string, type: ElementStateParamType ): unknown {
	if ( STATE_BINDING_PATTERN.test( input ) ) {
		return input;
	}

	if ( type === 'number' ) {
		return isNumericInput( input ) ? Number( input ) : input;
	}

	if ( type === 'boolean' ) {
		return BOOLEAN_INPUTS[ input ] ?? input;
	}

	if ( type === 'json' ) {
		return parseJsonInput( input );
	}

	return input;
}

export function formatStateValue( value: unknown ): string {
	if ( typeof value === 'string' ) {
		return value;
	}

	return JSON.stringify( value ) ?? '';
}

function isNumericInput( input: string ) {
	return input.trim() !== '' && Number.isFinite( Number( input ) );
}

function parseJsonInput( input: string ): unknown {
	try {
		return JSON.parse( input );
	} catch {
		return input;
	}
}
