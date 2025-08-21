import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { cssFilterFunctionPropUtil } from '@elementor/editor-props';

import { useBoundProp } from '../../../bound-prop-context';
import { type FilterFunction } from '../configs';
import { buildFilterConfig, type FilterSizePropType } from '../utils';

type FilterConfigEntry = {
	name: string;
	valueName: string;
	default: unknown;
	settings: FilterSizePropType[ 'settings' ];
};

type FilterConfigMap = Record< FilterFunction, FilterConfigEntry >;

type FilterConfigContextValue = {
	config: FilterConfigMap;
	filterOptions: Array< { value: string; label: string } >;
	getFilterFunctionConfig: ( filterFunction: FilterFunction ) => FilterConfigEntry;
	getInitialValue: () => unknown;
};

const FilterConfigContext = createContext< FilterConfigContextValue | null >( null );

export function FilterConfigProvider( { children }: React.PropsWithChildren ) {
	const propContext = useBoundProp( cssFilterFunctionPropUtil );

	const contextValue = useMemo( () => {
		const config = buildFilterConfig( propContext.propType );
		const filterOptions = Object.entries( config ).map( ( [ key, conf ] ) => ( {
			value: key,
			label: conf.name,
		} ) );

		return {
			config,
			filterOptions,
			getFilterFunctionConfig: ( filterFunction: FilterFunction ) => config[ filterFunction ],
			getInitialValue: () => config.blur.default,
		};
	}, [ propContext.propType ] );

	return <FilterConfigContext.Provider value={ contextValue }>{ children }</FilterConfigContext.Provider>;
}

export function useFilterConfig(): FilterConfigContextValue {
	const context = useContext( FilterConfigContext );

	if ( ! context ) {
		throw new Error( 'useFilterConfig must be used within FilterConfigProvider' );
	}

	return context;
}
