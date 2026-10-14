import { getPropSchemaFromCache, isTransformable } from '@elementor/editor-props';

type VariableInfo = {
	type: string;
	variableId: string;
	controlPath: string;
};

const VARIABLE_TYPE_KEYS = [
	'global-color-variable',
	'global-font-variable',
	'global-size-variable',
	'global-custom-size-variable',
] as const;

function tryExtractVariable( value: unknown ): { type: string; variableId: string } | null {
	for ( const key of VARIABLE_TYPE_KEYS ) {
		const propUtil = getPropSchemaFromCache( key );
		if ( propUtil?.isValid( value ) ) {
			return {
				type: key,
				variableId: propUtil.extract( value ) as string,
			};
		}
	}
	return null;
}

function traverse( value: unknown, path: string[], result: VariableInfo[] ): void {
	const extracted = tryExtractVariable( value );
	if ( extracted ) {
		result.push( {
			...extracted,
			controlPath: path.join( '.' ),
		} );
		return;
	}

	if ( isTransformable( value ) ) {
		traverse( value.value, path, result );
		return;
	}

	if ( value && typeof value === 'object' ) {
		for ( const [ key, val ] of Object.entries( value ) ) {
			traverse( val, [ ...path, key ], result );
		}
	}
}

export function extractVariablesFromStyleValue( styleValue: Record< string, unknown > ): VariableInfo[] {
	const result: VariableInfo[] = [];
	traverse( styleValue, [], result );
	return result;
}
