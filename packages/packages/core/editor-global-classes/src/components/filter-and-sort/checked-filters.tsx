import * as React from 'react';
import { ClearIcon } from '@elementor/icons';
import { Chip, IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilterAndSortContext } from './context';
import { checkBoxItems } from './css-class-filter';

export const CheckedFilters = () => {
	const { checked, setChecked } = useFilterAndSortContext();

	const handleClearFilters = ( e ) => {
		e.preventDefault();
		setChecked( {} );
	};
	const showCleanIcon = Object.values( checked ).some( ( value ) => value );
	return (
		<>
			<Stack direction="row" gap={ 0.5 } alignItems="center">
				{ Object.entries( checked ).map(
					( [ key, value ] ) =>
						value && (
							<Chip
								size="small"
								key={ key }
								label={ checkBoxItems.find( ( item ) => item.value === key )?.label }
								onDelete={ () => setChecked( ( prev ) => ( { ...prev, [ key ]: false } ) ) }
							/>
						)
				) }
				{ showCleanIcon && (
					<IconButton
						sx={ { marginLeft: 'auto' } }
						fontSize="tiny"
						onClick={ handleClearFilters }
						aria-label={ __( 'Clear filters', 'elementor' ) }
					>
						<ClearIcon fontSize="inherit" />
					</IconButton>
				) }
			</Stack>
		</>
	);
};
