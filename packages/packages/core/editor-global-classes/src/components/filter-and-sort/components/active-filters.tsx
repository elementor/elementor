import * as React from 'react';
import { Chip, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilterAndSortContext } from '../context';
import { ClearIconButton } from './clear-icon-button';
import { checkBoxItems } from './filter-list';

export const ActiveFilters = () => {
	const { checked, setChecked } = useFilterAndSortContext();

	const handleRemoveFilter = ( filterKey: keyof typeof checked ) => {
		setChecked( ( prev ) => ( { ...prev, [ filterKey ]: false } ) );
	};

	const showClearIcon = Object.values( checked ).some( ( value ) => value );

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Stack direction="row" gap={ 0.5 } alignItems="center" flexWrap="wrap">
				{ Object.entries( checked ).map(
					( [ key, value ] ) =>
						value && (
							<Chip
								size="tiny"
								key={ key }
								label={ checkBoxItems.find( ( item ) => item.value === key )?.label }
								onDelete={ () => handleRemoveFilter( key as keyof typeof checked ) }
							/>
						)
				) }
			</Stack>
			{ showClearIcon && (
				<ClearIconButton
					tooltipText={ __( 'Clear Filters', 'elementor' ) }
					sxStyle={ { margin: '0 0 auto auto', p: 0 } }
				/>
			) }
		</Stack>
	);
};
