import type { DropShadowFilterPropValue, PropType, SizePropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { type FilterFunction, type FilterFunctionGroup, type FilterGroup, FILTERS_BY_GROUP } from './configs';

const AMOUNT_VALUE_NAME = __( 'Amount', 'elementor' );

type Settings = {
	default_unit?: string;
	available_units: string[];
};

type SingleArgFilterFuncPropType = PropType & {
	shape: {
		size?: PropType & Settings;
	};
};

type DropShadowFuncPropType = PropType & {
	shape: {
		color: { default: unknown };
		xAxis: { default: unknown };
		yAxis: { default: unknown };
		blur: {
			default: unknown;
			settings: Settings;
		};
	};
};

type CssFilterFuncPropType = PropType & {
	shape: {
		args: {
			prop_types: {
				[ K in FilterFunctionGroup ]: SingleArgFilterFuncPropType | DropShadowFuncPropType;
			};
		};
	};
};

type Config = {
	defaultValue: { size: SizePropValue } | DropShadowFilterPropValue[ 'value' ];
	settings: Settings;
};

type CssFilterFuncValue = ReturnType< typeof createDefaultValue >;

export type FilterConfigEntry = {
	name: string;
	valueName: string;
	filterFunctionGroup: FilterFunctionGroup;
	default: CssFilterFuncValue;
	settings: Config[ 'settings' ];
};

type FilterConfigMap = Record< FilterFunction, FilterConfigEntry >;

const CONFIG_FACTORIES: Partial< Record< FilterFunction, ( propType: PropType ) => Config > > = {
	'drop-shadow': ( propType: PropType ) => buildDropShadowConfig( propType as DropShadowFuncPropType ),
};

export function buildFilterConfig( cssFilterPropType: PropType ): FilterConfigMap {
	const entries = ( Object.entries( FILTERS_BY_GROUP ) as [ FilterFunctionGroup, FilterGroup ][] ).flatMap(
		( [ filterFunctionGroup, group ] ) =>
			( Object.entries( group ) as [ FilterFunction, { name: string; valueName?: string } ][] ).map(
				( [ filterFunction, { name, valueName } ] ) => {
					const propType = extractPropType( cssFilterPropType as CssFilterFuncPropType, filterFunctionGroup ); // const sizePropType = extractSizePropType( cssPropType, filterFunctionGroup );

					const { defaultValue: value, settings } =
						CONFIG_FACTORIES[ filterFunction ]?.( propType ) ??
						buildSizeConfig( propType as SingleArgFilterFuncPropType );

					const defaultValue = createDefaultValue( { filterFunction, filterFunctionGroup, value } );

					const entry: FilterConfigEntry = {
						name,
						valueName: valueName ?? AMOUNT_VALUE_NAME,
						default: defaultValue,
						settings,
						filterFunctionGroup,
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

type DefaultBuilderArgs = {
	filterFunction: FilterFunction;
	filterFunctionGroup: FilterFunctionGroup;
	value: Config[ 'defaultValue' ];
};

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

function buildSizeConfig( propType: SingleArgFilterFuncPropType ): Config {
	const sizePropType = propType?.shape?.size;

	return {
		defaultValue: {
			size: sizePropType?.default as SizePropValue,
		},
		settings: {
			available_units: filterOutCustomUnit(
				sizePropType?.settings.available_units as Settings[ 'available_units' ]
			),
			default_unit: sizePropType?.settings.default_unit as Settings[ 'default_unit' ],
		},
	};
}

function buildDropShadowConfig( propType: DropShadowFuncPropType ): Config {
	const dropShadowPropType = propType.shape;

	return {
		defaultValue: {
			blur: dropShadowPropType?.blur?.default,
			xAxis: dropShadowPropType?.xAxis?.default,
			yAxis: dropShadowPropType?.yAxis?.default,
			color: dropShadowPropType?.color?.default,
		},
		settings: {
			available_units: filterOutCustomUnit( dropShadowPropType?.blur?.settings.available_units ),
		},
	};
}

function extractPropType( propType: CssFilterFuncPropType, filterFunctionGroup: FilterFunctionGroup ) {
	return propType.shape?.args?.prop_types[ filterFunctionGroup ];
}

// TODO to remove this when we refactor the size control to receive units from backend [ticket number here to be added]
function filterOutCustomUnit( units: string[] ) {
	return units.filter( ( unit ) => unit !== 'custom' );
}
