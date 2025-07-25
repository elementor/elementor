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

	const handleRemoveFilter = ( filterKey: keyof typeof filters ) => {
		setFilters( ( prev ) => ( { ...prev, [ filterKey ]: false } ) );
	};

	const showClearIcon = Object.values( filters ).some( ( value ) => value );

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Stack direction="row" gap={ 0.5 } alignItems="center" flexWrap="wrap">
				{ Object.entries( filters ).map(
					( [ key, value ] ) =>
						value && (
							<Chip
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
					sxStyle={ { margin: '0 0 auto auto' } }
				/>
			) }
		</Stack>
	);
};
