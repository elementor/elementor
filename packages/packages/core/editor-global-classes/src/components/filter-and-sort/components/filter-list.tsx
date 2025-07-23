import * as React from 'react';
import { Chip, MenuList } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredCssClassUsage } from '../../../hooks/use-filtered-css-class-usage';
import { useFilterAndSortContext } from '../context';
import { type FilterKey } from '../types';
import { LabeledCheckbox } from './labeld-checkbox';

export type CheckBoxItem = {
	label: string;
	value: FilterKey;
};

export const checkBoxItems: CheckBoxItem[] = [
	{
		label: __( 'Unused', 'elementor' ),
		value: 'unused',
	},
	{
		label: __( 'Empty', 'elementor' ),
		value: 'empty',
	},
	{
		label: __( 'On this page', 'elementor' ),
		value: 'onThisPage',
	},
];

export const FilterList = () => {
	const { checked, setChecked } = useFilterAndSortContext();
	const filteredCssClass = useFilteredCssClassUsage();

	const handleOnClick = ( value: FilterKey ) => {
		setChecked( ( prev ) => ( { ...prev, [ value ]: ! prev[ value ] } ) );
	};

	return (
		<MenuList>
			{ checkBoxItems.map( ( { label, value }: CheckBoxItem ) => (
				<LabeledCheckbox
					suffix={ <Chip sx={ { ml: 'auto' } } label={ filteredCssClass[ value ].length || 0 } /> }
					key={ label }
					label={ label }
					onClick={ () => handleOnClick( value ) }
					checked={ checked[ value ] || false }
				/>
			) ) }
		</MenuList>
	);
};
