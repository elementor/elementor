import { service } from '@elementor/editor-variables';

type ValidationWarning = {
	property: string;
	hardcodedValue: string;
	matchingVariables: Array<{ id: string; label: string; value: string }>;
	type: 'color' | 'font';
};

type ValidationResult = {
	warnings: ValidationWarning[];
	shouldBlock: boolean;
};

const normalizeColor = ( color: string ): string => {
	return color.toLowerCase().trim().replace( /\s+/g, '' );
};

const scanPropsForHardcodedValues = (
	props: Record< string, any >,
	path = ''
): Array< { property: string; value: string; type: 'color' | 'font' } > => {
	const hardcodedValues: Array< { property: string; value: string; type: 'color' | 'font' } > = [];

	const scan = ( obj: any, currentPath: string ) => {
		if ( ! obj || typeof obj !== 'object' ) {
			return;
		}

		if ( obj.$$type === 'color' && typeof obj.value === 'string' ) {
			hardcodedValues.push( {
				property: currentPath,
				value: obj.value,
				type: 'color',
			} );
			return;
		}

		if ( obj.$$type === 'global-color-variable' || obj.$$type === 'global-font-variable' ) {
			return;
		}

		for ( const key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				const newPath = currentPath ? `${ currentPath }.${ key }` : key;
				scan( obj[ key ], newPath );
			}
		}
	};

	scan( props, path );
	return hardcodedValues;
};

const findMatchingVariables = (
	hardcodedValue: string,
	type: 'color' | 'font'
): Array< { id: string; label: string; value: string } > => {
	const variables = service.variables();
	const matches: Array< { id: string; label: string; value: string } > = [];

	const typeMapping: Record< 'color' | 'font', string > = {
		color: 'global-color-variable',
		font: 'global-font-variable',
	};

	const targetType = typeMapping[ type ];

	for ( const [ id, variable ] of Object.entries( variables ) ) {
		if ( variable.deleted ) {
			continue;
		}

		if ( variable.type !== targetType ) {
			continue;
		}

		const variableValue = type === 'color' ? normalizeColor( variable.value ) : variable.value;
		const hardcodedValueNormalized =
			type === 'color' ? normalizeColor( hardcodedValue ) : hardcodedValue;

		if ( variableValue === hardcodedValueNormalized ) {
			matches.push( {
				id,
				label: variable.label,
				value: variable.value,
			} );
		}
	}

	return matches;
};

export const formatWarnings = ( warnings: ValidationWarning[] ): string => {
	const lines: string[] = [];

	for ( const warning of warnings ) {
		lines.push( `\nProperty "${ warning.property }"` );
		lines.push( `  Hardcoded ${ warning.type }: ${ warning.hardcodedValue }` );
		lines.push( `  Matching variables:` );
		for ( const variable of warning.matchingVariables ) {
			lines.push( `    - "${ variable.label }" (value: ${ variable.value })` );
		}
	}

	return lines.join( '\n' );
};

export const validateVariableReuse = (
	props: Record< string, any >,
	justification?: string
): ValidationResult => {
	const hardcodedValues = scanPropsForHardcodedValues( props );
	const warnings: ValidationWarning[] = [];

	for ( const { property, value, type } of hardcodedValues ) {
		const matchingVariables = findMatchingVariables( value, type );

		if ( matchingVariables.length > 0 ) {
			warnings.push( {
				property,
				hardcodedValue: value,
				matchingVariables,
				type,
			} );
		}
	}

	const shouldBlock = warnings.length > 0 && ! justification;

	return {
		warnings,
		shouldBlock,
	};
};
