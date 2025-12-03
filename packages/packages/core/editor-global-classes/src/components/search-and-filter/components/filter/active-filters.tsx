import * as React from 'react';
import { Chip, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { FilterKey } from '../../../../hooks/use-filtered-css-class-usage';
import { trackGlobalClasses } from '../../../../utils/tracking';
import { useSearchAndFilters } from '../../context';
import { ClearIconButton } from './clear-icon-button';
import { filterConfig } from './filter-list';

export const ActiveFilters = () => {
	const {
		filters: { filters, setFilters },
	} = useSearchAndFilters();

	const handleRemove = ( key: FilterKey ) => {
		setFilters( ( prev ) => ( { ...prev, [ key ]: false } ) );
		trackGlobalClasses( {
			event: 'classManagerFilterUsed',
			action: 'remove',
			type: key,
			trigger: 'header',
		} );
	};

	const activeKeys = Object.keys( filters ).filter( ( key ): key is FilterKey => filters[ key as FilterKey ] );

	const showClearIcon = activeKeys.length > 0;

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Stack direction="row" gap={ 0.5 } alignItems="center" flexWrap="wrap">
				{ activeKeys.map( ( key ) => (
					<Chip
						key={ key }
						label={ filterConfig[ key ] }
						onDelete={ () => handleRemove( key ) }
						sx={ chipSx }
						size="tiny"
					/>
				) ) }
			</Stack>
			{ showClearIcon && (
				<ClearIconButton
					trigger="header"
					tooltipText={ __( 'Clear Filters', 'elementor' ) }
					sx={ { margin: '0 0 auto auto' } }
				/>
			) }
		</Stack>
	);
};

const chipSx = {
	'& .MuiChip-deleteIcon': {
		display: 'none',
		transition: 'opacity 0.2s',
	},
	'&:hover .MuiChip-deleteIcon': {
		display: 'block',
	},
};
