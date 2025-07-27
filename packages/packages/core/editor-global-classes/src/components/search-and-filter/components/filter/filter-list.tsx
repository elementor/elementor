import * as React from 'react';
import { Checkbox, Chip, MenuItem, MenuList, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FilterKey, useFilteredCssClassUsage } from '../../../../hooks/use-filtered-css-class-usage';
import { type CheckedFilters, useSearchAndFilters } from '../../context';

export const FilterList = () => {
	const {
		filters: { filters, setFilters },
	} = useSearchAndFilters();
	const filteredCssClass = useFilteredCssClassUsage();

	const handleOnClick = ( value: FilterKey ) => {
		setFilters( ( prev ) => ( {
			...prev,
			[ value as keyof CheckedFilters ]: ! prev[ value as keyof CheckedFilters ],
		} ) );
	};

	return (
		<MenuList>
			<LabeledCheckbox
				label={ __( 'Unused', 'elementor' ) }
				onClick={ () => handleOnClick( 'unused' ) }
				checked={ filters.unused || false }
				suffix={ <Chip size={ 'small' } sx={ { ml: 'auto' } } label={ filteredCssClass.unused.length || 0 } /> }
			/>
			<LabeledCheckbox
				label={ __( 'Empty', 'elementor' ) }
				onClick={ () => handleOnClick( 'empty' ) }
				checked={ filters.empty || false }
				suffix={ <Chip size={ 'small' } sx={ { ml: 'auto' } } label={ filteredCssClass.empty.length || 0 } /> }
			/>
			<LabeledCheckbox
				label={ __( 'On this page', 'elementor' ) }
				onClick={ () => handleOnClick( 'onThisPage' ) }
				checked={ filters.onThisPage || false }
				suffix={
					<Chip size={ 'small' } sx={ { ml: 'auto' } } label={ filteredCssClass.onThisPage.length || 0 } />
				}
			/>
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
