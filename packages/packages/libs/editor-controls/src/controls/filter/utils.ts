import type { DropShadowFilterPropValue, PropType, SizePropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { type FilterFunction, type FilterFunctionGroup, type FilterGroup, FILTERS_BY_GROUP } from './configs';

const AMOUNT_VALUE_NAME = __( 'Amount', 'elementor' );

export type FilterSizePropType = PropType & {
	settings: {
		default_unit: string;
		available_units: string;
	};
};

type CssFilterFuncPropType = PropType & {
	shape: {
		args: {
			prop_types: {
				[ K in FilterFunctionGroup ]: {
					shape: {
						size: FilterSizePropType;
					};
				};
			};
		};
	};
};

type DefaultValueUnion = { size: SizePropValue } | DropShadowFilterPropValue[ 'value' ];

type DefaultBuilderArgs = {
	filterFunction: FilterFunction;
	filterFunctionGroup: FilterFunctionGroup;
	value: DefaultValueUnion;
};

type CssFilterFuncValue = ReturnType< typeof createDefaultValue >;

type FilterConfigEntry = {
	name: string;
	valueName: string;
	default: CssFilterFuncValue;
	settings: FilterSizePropType[ 'settings' ];
};

type FilterConfigMap = Record< FilterFunction, FilterConfigEntry >;

const DEFAULT_FACTORIES: Partial< Record< FilterFunction, ( sizePropType: PropType ) => DefaultValueUnion > > = {
	'drop-shadow': ( sizePropType: PropType ) => sizePropType.default as DefaultValueUnion,
};

export function buildFilterConfig( propType: PropType ): FilterConfigMap {
	const cssPropType = propType as CssFilterFuncPropType;

	const entries = ( Object.entries( FILTERS_BY_GROUP ) as [ FilterFunctionGroup, FilterGroup ][] ).flatMap(
		( [ filterFunctionGroup, group ] ) =>
			( Object.entries( group ) as [ FilterFunction, { name: string; valueName?: string } ][] ).map(
				( [ filterFunction, { name, valueName } ] ) => {
					const sizePropType = extractSizePropType( cssPropType, filterFunctionGroup );

					const value =
						DEFAULT_FACTORIES[ filterFunction ]?.( sizePropType ) ?? buildSizeDefault( sizePropType );

					const defaultValue = createDefaultValue( { filterFunction, filterFunctionGroup, value } );
					const settings = getSettings( sizePropType );

					const entry: FilterConfigEntry = {
						name,
						valueName: valueName ?? AMOUNT_VALUE_NAME,
						default: defaultValue,
						settings,
					};

					return [ filterFunction, entry ] as const;
				}
			)
	);

	return entries.reduce< FilterConfigMap >( ( acc, [ func, conf ] ) => {
		acc[ func ] = conf;
		return acc;
	}, {} as FilterConfigMap );
}

function createDefaultValue( { filterFunction, filterFunctionGroup, value }: DefaultBuilderArgs ) {
	return {
		$$type: 'css-filter-func',
		value: {
			func: { $$type: 'string', value: filterFunction },
			args: {
				$$type: filterFunctionGroup,
				value,
			},
		},
	};
}

function buildSizeDefault( sizePropType: PropType ): DefaultValueUnion {
	return {
		size: sizePropType.default as SizePropValue,
	};
}

function getSettings( sizePropType: FilterSizePropType ) {
	return {
		default_unit: sizePropType?.settings.default_unit,
		available_units: sizePropType?.settings.available_units,
	};
}

function extractSizePropType( propType: CssFilterFuncPropType, filterFunctionGroup: FilterFunctionGroup ) {
	return propType.shape?.args?.prop_types[ filterFunctionGroup ]?.shape?.size;
}
