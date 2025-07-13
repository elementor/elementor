import {
	extractValue,
	isDependencyMet,
	type PropsSchema,
	type PropType,
	type TransformablePropValue,
} from '@elementor/editor-props';

type Value = TransformablePropValue< string > | null;

export type Values = Record< string, Value >;

export function extractOrderedDependencies(
	bind: string,
	propsSchema: PropsSchema,
	elementValues: Values,
	dependenciesPerTargetMapping: Record< string, string[] >
): string[] {
	const prop = getPropType( propsSchema, elementValues, bind.split( '.' ) );

	if ( ! prop ) {
		return [];
	}

	const dependencies: string[] = [];

	if ( 'object' === prop.kind ) {
		dependencies.push( ...Object.keys( prop.shape ).map( ( key ) => bind + '.' + key ) );
	}

	const directDependencies = extractPropOrderedDependencies( bind, dependenciesPerTargetMapping );

	if ( ! dependencies.length ) {
		return directDependencies;
	}

	return dependencies.reduce(
		( carry, dependency ) => [
			...carry,
			...extractOrderedDependencies( dependency, propsSchema, elementValues, dependenciesPerTargetMapping ),
		],
		directDependencies
	);
}

function extractPropOrderedDependencies(
	bind: string,
	dependenciesPerTargetMapping: Record< string, string[] >
): string[] {
	if ( ! dependenciesPerTargetMapping?.[ bind ]?.length ) {
		return [];
	}

	return dependenciesPerTargetMapping[ bind ].reduce< string[] >(
		( dependencies, dependency ) => [
			...dependencies,
			dependency,
			...extractPropOrderedDependencies( dependency, dependenciesPerTargetMapping ),
		],
		[]
	);
}

export function updateValues(
	values: Values,
	dependencies: string[],
	propsSchema: PropsSchema,
	elementValues: Values
): Values {
	if ( ! dependencies.length ) {
		return values;
	}

	return dependencies.reduce(
		( newValues, dependency ) => {
			const path = dependency.split( '.' );
			const propType = getPropType( propsSchema, elementValues, path );
			const combinedValues = { ...elementValues, ...newValues };

			if ( ! propType ) {
				return newValues;
			}

			if ( ! isDependencyMet( propType?.dependencies, combinedValues ) ) {
				return {
					...newValues,
					...updateValue( path, null, combinedValues ),
				};
			}

			return newValues;
		},
		{ ...values }
	);
}

function getPropType( schema: PropsSchema, elementValues: Values, path: string[] ): PropType | null {
	if ( ! path.length ) {
		return null;
	}

	const [ basePropKey, ...keys ] = path;
	const baseProp = schema[ basePropKey ];

	if ( ! baseProp ) {
		return null;
	}

	return keys.reduce( ( prop: PropType | null, key, index ) => {
		if ( ! prop?.kind ) {
			return null;
		}

		if ( 'union' === prop.kind ) {
			const value = extractValue( path.slice( 0, index + 1 ), elementValues );
			const type = ( value?.$$type as string ) ?? null;

			return getPropType(
				{ [ basePropKey ]: prop.prop_types?.[ type ] },
				elementValues,
				path.slice( 0, index + 2 )
			);
		}

		if ( 'array' === prop.kind ) {
			return prop.item_prop_type;
		}

		if ( 'object' === prop.kind ) {
			return prop.shape[ key ];
		}

		return prop[ key as keyof typeof prop ] as PropType;
	}, baseProp );
}

function updateValue( path: string[], value: Value, values: Values ) {
	const topPropKey = path[ 0 ];
	const newValue: Values = { ...values };

	path.reduce( ( carry: Values | null, key, index ) => {
		if ( ! carry ) {
			return null;
		}

		if ( index === path.length - 1 ) {
			carry[ key ] = value !== null ? ( { ...( carry[ key ] ?? {} ), value } as Value ) : null;

			return ( carry[ key ]?.value as Values ) ?? carry.value;
		}

		return ( carry[ key ]?.value as Values ) ?? carry.value;
	}, newValue );

	return { [ topPropKey ]: newValue[ topPropKey ] ?? null };
}
