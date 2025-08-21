import * as React from 'react';
import {
	type CreateOptions,
	cssFilterFunctionPropUtil,
	type FilterItemPropValue,
	type PropKey,
} from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { PopoverContent } from '../../components/popover-content';
import { PopoverGridContainer } from '../../components/popover-grid-container';
import { useRepeaterContext } from '../../components/unstable-repeater/context/repeater-context';
import { SelectControl } from '../select-control';
import { type FilterFunction } from './configs';
import { useFilterConfig } from './context/filter-config-context';
import { DropShadowItemContent } from './controls/drop-shadow/drop-shadow-item-content';
import { useFilterRepeaterConfigs } from './hooks/use-filter-repeater-configs';

type Value = FilterItemPropValue[ 'value' ];

export const FilterContent = () => {
	const propContext = useBoundProp( cssFilterFunctionPropUtil );
	const { filterOptions, getFilterFunctionConfig } = useFilterRepeaterConfigs();

	const handleValueChange = ( value: Value, _?: CreateOptions, meta?: { bind?: PropKey } ) => {
		let newValue = structuredClone( value );
		const funcConfig = getFilterFunctionConfig( newValue?.func.value as FilterFunction );

		if ( meta?.bind === 'func' ) {
			newValue = funcConfig.default.value as FilterItemPropValue[ 'value' ];
		}

		if ( ! newValue.args ) {
			return;
		}

		propContext.setValue( newValue );
	};

	return (
		<PropProvider { ...propContext } setValue={ handleValueChange }>
			<PopoverContent p={ 1.5 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Filter', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<PropKeyProvider bind="func">
							<SelectControl options={ filterOptions } />
						</PropKeyProvider>
					</Grid>
				</PopoverGridContainer>
				<PropKeyProvider bind="args">
					<FilterValueContent />
				</PropKeyProvider>
			</PopoverContent>
		</PropProvider>
	);
};
// handle case where the be doen't have settings
const FilterValueContent = () => {
	const { openItemIndex, items } = useRepeaterContext();
	const currentItem = items[ openItemIndex ];
	const { filterOpt } = useFilterConfig();

	const filterName = ( currentItem.item.value as FilterItemPropValue[ 'value' ] ).func.value;
	const isDropShadow = filterName === 'drop-shadow';

	if ( isDropShadow ) {
		return <DropShadowItemContent units={ units } anchorEl={ anchorEl } />;
	}

	return null;
	// const filterName = filterType?.value || 'blur';
	// const filterItemConfig = filterConfig[ filterName ];
	// const { units = [] } = filterItemConfig;
	//
	// return isSingleSize( filterName ) ? (
	// 	<SingleSizeItemContent filterType={ filterName } />
	// ) : (
	// 	<DropShadowItemContent units={ units as LengthUnit[] } anchorEl={ anchorEl } />
	// );
};

//
// filterKeys.map( ( filterKey ) => ( {
// 									label: filterConfig[ filterKey ].name,
// 									value: filterKey,
// 								} ) )
