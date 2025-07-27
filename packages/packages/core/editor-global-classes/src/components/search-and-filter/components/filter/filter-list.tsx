import * as React from 'react';
import { Checkbox, Chip, MenuItem, MenuList, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FilterKey, useFilteredCssClassUsage } from '../../../../hooks/use-filtered-css-class-usage';
import { useSearchAndFilters } from '../../context';

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

type LabeledCheckboxProps = {
	label: string;
	suffix?: React.ReactNode;
	onClick: () => void;
	checked: boolean;
};

const LabeledCheckbox = ( { label, suffix, onClick, checked }: LabeledCheckboxProps ) => (
	<MenuItem onClick={ onClick }>
		<Stack direction="row" alignItems="center" gap={ 0.5 } flex={ 1 }>
			<Checkbox
				checked={ checked }
				sx={ {
					padding: 0,
					color: 'text.tertiary',
					'&:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked': {
						color: 'text.tertiary',
					},
				} }
			/>
			<Typography variant="caption" sx={ { color: 'text.secondary' } }>
				{ label }
			</Typography>
			{ suffix }
		</Stack>
	</MenuItem>
);
