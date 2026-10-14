import type { DropShadowFilterPropValue, PropType, SizePropValue, UnionPropType } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { type FilterFunction, type FilterFunctionGroup, FILTERS_BY_GROUP } from './configs';

const AMOUNT_VALUE_NAME = __( 'Amount', 'elementor' );

type SingleArgFilterFuncPropType = PropType & {
	shape: {
		size?: PropType;
	};
};

type DropShadowFuncPropType = PropType & {
	shape: {
		color: PropType;
		xAxis: PropType;
		yAxis: PropType;
		blur: PropType;
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

export type DefaultValue = { size: SizePropValue } | DropShadowFilterPropValue[ 'value' ];

type CssFilterFuncValue = ReturnType< typeof createDefaultValue >;

export type FilterConfigEntry = {
	name: string;
	valueName: string;
	filterFunctionGroup: FilterFunctionGroup;
	defaultValue: CssFilterFuncValue;
};

type FilterConfigMap = Record< FilterFunction, FilterConfigEntry >;

const DEFAULT_FACTORIES: Partial< Record< FilterFunction, ( propType: PropType ) => DefaultValue > > = {
	'drop-shadow': ( propType: PropType ) => buildDropShadowDefault( propType as DropShadowFuncPropType ),
};

export function buildFilterConfig( cssFilterPropType: PropType ): FilterConfigMap {
	function createEntry(
		filterFunctionGroup: FilterFunctionGroup,
		filterFunction: FilterFunction,
		{ name, valueName }: { name: string; valueName?: string }
	): [ FilterFunction, FilterConfigEntry ] {
		const propType = extractPropType( cssFilterPropType as CssFilterFuncPropType, filterFunctionGroup );

		const value =
			DEFAULT_FACTORIES[ filterFunction ]?.( propType ) ??
			buildSizeDefault( propType as SingleArgFilterFuncPropType );

		const defaultValue = createDefaultValue( {
			filterFunction,
			filterFunctionGroup,
			value,
		} );

		return [
			filterFunction,
			{
				name,
				valueName: valueName ?? AMOUNT_VALUE_NAME,
				defaultValue,
				filterFunctionGroup,
			},
		];
	}

	const entries = Object.entries( FILTERS_BY_GROUP ).flatMap( ( [ filterFunctionGroup, group ] ) =>
		Object.entries( group ).map( ( [ filterFunction, meta ] ) =>
			createEntry( filterFunctionGroup as FilterFunctionGroup, filterFunction as FilterFunction, meta )
		)
	);

	return Object.fromEntries( entries ) as FilterConfigMap;
}

type DefaultBuilderArgs = {
	filterFunction: FilterFunction;
	filterFunctionGroup: FilterFunctionGroup;
	value: DefaultValue;
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

function buildSizeDefault( propType: SingleArgFilterFuncPropType ): DefaultValue {
	const sizePropType = propType?.shape?.size;

	return {
		size: sizePropType?.default as SizePropValue,
	};
}

function buildDropShadowDefault( propType: DropShadowFuncPropType ): DefaultValue {
	const dropShadowPropType = propType.shape;

	return {
		blur: dropShadowPropType?.blur?.default,
		xAxis: dropShadowPropType?.xAxis?.default,
		yAxis: dropShadowPropType?.yAxis?.default,
		color:
			dropShadowPropType?.color?.default ??
			( dropShadowPropType?.color as UnionPropType ).prop_types.color.default,
	};
}

function extractPropType( propType: CssFilterFuncPropType, filterFunctionGroup: FilterFunctionGroup ) {
	return propType.shape?.args?.prop_types[ filterFunctionGroup ];
}
