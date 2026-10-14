import * as React from 'react';
import { Checkbox, Chip, MenuItem, MenuList, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FilterKey, useFilteredCssClassUsage } from '../../../../hooks/use-filtered-css-class-usage';
import { trackGlobalClasses } from '../../../../utils/tracking';
import { useSearchAndFilters } from '../../context';

export const filterConfig: Record< FilterKey, string > = {
	unused: __( 'Unused', 'elementor' ),
	empty: __( 'Empty', 'elementor' ),
	onThisPage: __( 'On this page', 'elementor' ),
};

export const FilterList = () => {
	const {
		filters: { filters, setFilters },
	} = useSearchAndFilters();
	const filteredCssClass = useFilteredCssClassUsage();

	const handleOnClick = ( value: FilterKey ) => {
		setFilters( ( prev ) => ( { ...prev, [ value ]: ! prev[ value ] } ) );
		trackGlobalClasses( {
			event: 'classManagerFilterUsed',
			action: filters[ value ] ? 'remove' : 'apply',
			type: value,
			trigger: 'menu',
		} );
	};

	return (
		<MenuList>
			<MenuItem onClick={ () => handleOnClick( 'unused' ) }>
				<LabeledCheckbox
					label={ filterConfig.unused }
					checked={ filters.unused }
					suffix={ <Chip size={ 'tiny' } sx={ { ml: 'auto' } } label={ filteredCssClass.unused.length } /> }
				/>
			</MenuItem>
			<MenuItem onClick={ () => handleOnClick( 'empty' ) }>
				<LabeledCheckbox
					label={ filterConfig.empty }
					checked={ filters.empty }
					suffix={ <Chip size={ 'tiny' } sx={ { ml: 'auto' } } label={ filteredCssClass.empty.length } /> }
				/>
			</MenuItem>
			<MenuItem onClick={ () => handleOnClick( 'onThisPage' ) }>
				<LabeledCheckbox
					label={ filterConfig.onThisPage }
					checked={ filters.onThisPage }
					suffix={
						<Chip size={ 'tiny' } sx={ { ml: 'auto' } } label={ filteredCssClass.onThisPage.length } />
					}
				/>
			</MenuItem>
		</MenuList>
	);
};

type LabeledCheckboxProps = {
	label: string;
	suffix?: React.ReactNode;
	checked: boolean;
};

const LabeledCheckbox = ( { label, suffix, checked }: LabeledCheckboxProps ) => (
	<Stack direction="row" alignItems="center" gap={ 0.5 } flex={ 1 }>
		<Checkbox
			size={ 'small' }
			checked={ checked }
			sx={ {
				padding: 0,
				color: 'text.tertiary',
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
);
