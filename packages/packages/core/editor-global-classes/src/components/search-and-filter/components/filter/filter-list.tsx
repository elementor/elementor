import * as React from 'react';
import { Chip, MenuList } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilteredCssClassUsage } from '../../../../hooks/use-filtered-css-class-usage';
import { useSearchAndFilters } from '../../context';
import { type FilterKey } from '../../types';
import { LabeledCheckbox } from './labeld-checkbox';

type CheckBoxItem = {
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
	const {
		filters: { filters, setFilters },
	} = useSearchAndFilters();
	const filteredCssClass = useFilteredCssClassUsage();

	const handleOnClick = ( value: FilterKey ) => {
		setFilters( ( prev ) => ( { ...prev, [ value ]: ! prev[ value ] } ) );
	};

	return (
		<MenuList>
			{ checkBoxItems.map( ( { label, value }: CheckBoxItem ) => (
				<LabeledCheckbox
					suffix={
						<Chip size={ 'small' } sx={ { ml: 'auto' } } label={ filteredCssClass[ value ].length || 0 } />
					}
					key={ label }
					label={ label }
					onClick={ () => handleOnClick( value ) }
					checked={ filters[ value ] || false }
				/>
			) ) }
		</MenuList>
	);
};
