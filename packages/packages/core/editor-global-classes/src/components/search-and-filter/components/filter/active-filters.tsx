import * as React from 'react';
import { Chip, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSearchAndFilters } from '../../context';
import { ClearIconButton } from './clear-icon-button';
import { checkBoxItems } from './filter-list';

export const ActiveFilters = () => {
	const {
		filters: { filters, setFilters },
	} = useSearchAndFilters();

	const handleRemoveFilter = React.useCallback(
		( filterKey: keyof typeof filters ) => {
			setFilters( ( prev ) => ( { ...prev, [ filterKey ]: false } ) );
		},
		[ setFilters ]
	);

	const showClearIcon = Object.values( filters ).some( ( value ) => value );

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Stack direction="row" gap={ 0.5 } alignItems="center" flexWrap="wrap">
				{ Object.entries( filters ).map(
					( [ key, value ] ) =>
						value && (
							<Chip
								sx={ {
									'& .MuiChip-deleteIcon': {
										display: 'none',
										transition: 'opacity 0.2s',
									},
									'&:hover .MuiChip-deleteIcon': {
										display: 'block',
									},
								} }
								size="tiny"
								key={ key }
								label={ checkBoxItems.find( ( item ) => item.value === key )?.label }
								onDelete={ () => handleRemoveFilter( key as keyof typeof filters ) }
							/>
						)
				) }
			</Stack>
			{ showClearIcon && (
				<ClearIconButton
					tooltipText={ __( 'Clear Filters', 'elementor' ) }
					sx={ { margin: '0 0 auto auto' } }
				/>
			) }
		</Stack>
	);
};
