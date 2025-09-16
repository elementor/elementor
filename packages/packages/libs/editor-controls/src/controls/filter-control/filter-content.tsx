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
import { DropShadowItemContent } from './drop-shadow/drop-shadow-item-content';
import { SingleSizeItemContent } from './single-size/single-size-item-content';

type Value = FilterItemPropValue[ 'value' ];

export const FilterContent = () => {
	const propContext = useBoundProp( cssFilterFunctionPropUtil );
	const { filterOptions, getFilterFunctionConfig } = useFilterConfig();

	const handleValueChange = ( value: Value, _?: CreateOptions, meta?: { bind?: PropKey } ) => {
		let newValue = structuredClone( value );
		const funcConfig = getFilterFunctionConfig( newValue?.func.value as FilterFunction );

		if ( meta?.bind === 'func' ) {
			newValue = funcConfig.defaultValue.value as FilterItemPropValue[ 'value' ];
		}

		if ( ! newValue.args ) {
			return;
		}

		propContext.setValue( newValue );
	};

	return (
		<PropProvider { ...propContext } setValue={ handleValueChange }>
			<PropKeyProvider bind="css-filter-func">
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
			</PropKeyProvider>
		</PropProvider>
	);
};

const FilterValueContent = () => {
	const { openItemIndex, items } = useRepeaterContext();
	const currentItem = items[ openItemIndex ];

	const filterFunc = ( currentItem.item.value as FilterItemPropValue[ 'value' ] ).func.value;
	const isDropShadow = filterFunc === 'drop-shadow';

	if ( isDropShadow ) {
		return <DropShadowItemContent />;
	}

	return <SingleSizeItemContent filterFunc={ filterFunc as FilterFunction } />;
};
