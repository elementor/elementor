import {
	type DependencyTerm,
	extractValue,
	isDependencyMet,
	type PropsSchema,
	type PropType,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem } from '@elementor/session';

type Value = TransformablePropValue< string > | null;

export type Values = Record< string, Value >;

export function extractOrderedDependencies( dependenciesPerTargetMapping: Record< string, string[] > ): string[] {
	return Object.values( dependenciesPerTargetMapping )
		.flat()
		.filter( ( dependent, index, self ) => self.indexOf( dependent ) === index );
}

export function getUpdatedValues(
	values: Values,
	dependencies: string[],
	propsSchema: PropsSchema,
	elementValues: Values,
	elementId: string
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

			const testDependencies = {
				previousValues: isDependencyMet( propType.dependencies, elementValues ),
				newValues: isDependencyMet( propType.dependencies, combinedValues ),
			};

			if ( ! testDependencies.newValues.isMet ) {
				const newValue = handleUnmetCondition( {
					failingDependencies: testDependencies.newValues.failingDependencies,
					dependency,
					elementValues: combinedValues,
					defaultValue: propType.default as Value,
					elementId,
				} );

				return {
					...newValues,
					...updateValue( path, newValue, combinedValues ),
				};
			}

			if ( ! testDependencies.previousValues.isMet ) {
				const savedValue = retrievePreviousValueFromStorage< Value >( { path: dependency, elementId } );

				removePreviousValueFromStorage( { path: dependency, elementId } );

				return {
					...newValues,
					...updateValue( path, savedValue ?? ( propType.default as Value ), combinedValues ),
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

	return keys.reduce(
		( prop: PropType | null, key, index ) =>
			evaluatePropType( { prop, key, index, path, elementValues, basePropKey } ),
		baseProp
	);
}

function evaluatePropType( props: {
	prop: PropType | null;
	key: string;
	index: number;
	path: string[];
	elementValues: Values;
	basePropKey: string;
} ) {
	const { prop } = props;

	if ( ! prop?.kind ) {
		return null;
	}

	const { key, index, path, elementValues, basePropKey } = props;

	switch ( prop.kind ) {
		case 'union':
			const value = extractValue( path.slice( 0, index + 1 ), elementValues );
			const type = ( value?.$$type as string ) ?? null;

			return getPropType(
				{ [ basePropKey ]: prop.prop_types?.[ type ] },
				elementValues,
				path.slice( 0, index + 2 )
			);
		case 'array':
			return prop.item_prop_type;
		case 'object':
			return prop.shape[ key ];
	}

	return prop[ key as keyof typeof prop ] as PropType;
}

function updateValue( path: string[], value: Value, values: Values ) {
	const topPropKey = path[ 0 ];
	const newValue: Values = { ...values };

	path.reduce( ( carry: Values | null, key, index ) => {
		if ( ! carry ) {
			return null;
		}

		if ( index === path.length - 1 ) {
			carry[ key ] = value ?? null;

			return ( carry[ key ]?.value as Values ) ?? carry.value;
		}

		return ( carry[ key ]?.value as Values ) ?? carry.value;
	}, newValue );

	return { [ topPropKey ]: newValue[ topPropKey ] ?? null };
}

function handleUnmetCondition( props: {
	failingDependencies: DependencyTerm[];
	dependency: string;
	elementValues: Values;
	defaultValue: Value;
	elementId: string;
} ) {
	const { failingDependencies, dependency, elementValues, defaultValue, elementId } = props;
	const newValue = failingDependencies.find( ( term ) => term.newValue )?.newValue ?? null;
	const currentValue = extractValue( dependency.split( '.' ), elementValues ) ?? defaultValue;

	savePreviousValueToStorage( {
		path: dependency,
		elementId,
		value: currentValue,
	} );

	return newValue;
}

function savePreviousValueToStorage( { path, elementId, value }: { path: string; elementId: string; value: unknown } ) {
	const prefix = `elementor/${ elementId }`;
	const savedValue = retrievePreviousValueFromStorage( { path, elementId } );

	if ( savedValue ) {
		return;
	}

	const key = `${ prefix }:${ path }`;

	setSessionStorageItem( key, value );
}

function retrievePreviousValueFromStorage< T >( { path, elementId }: { path: string; elementId: string } ) {
	const prefix = `elementor/${ elementId }`;
	const key = `${ prefix }:${ path }`;

	return getSessionStorageItem< T >( key ) ?? null;
}

function removePreviousValueFromStorage( { path, elementId }: { path: string; elementId: string } ) {
	const prefix = `elementor/${ elementId }`;
	const key = `${ prefix }:${ path }`;

	removeSessionStorageItem( key );
}
