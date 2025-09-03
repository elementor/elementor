import * as React from 'react';
import { useState } from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, FilledInput, InputAdornment, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	onSearchChange: ( search: string ) => void;
	onFilterChange: ( filter: string ) => void;
};

export const VariablesManagerFilters = ( { onSearchChange, onFilterChange }: Props ) => {
	const [ inputValue, setInputValue ] = useState( '' );

	const handleSearchChange = ( search: string ) => {
		setInputValue( search );
		onSearchChange( search );
	};

	const handleFilterChange = ( filter: string ) => {
		onFilterChange( filter );
	};

	return (
		<Stack direction="row" gap={ 0.5 } sx={ { width: '100%' } }>
			<Box sx={ { flexGrow: 1 } }>
				<TextField
					role={ 'search' }
					fullWidth
					size={ 'tiny' }
					value={ inputValue }
					placeholder={ __( 'Search', 'elementor' ) }
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleSearchChange( e.target.value ) }
					InputProps={ {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize={ 'tiny' } />
							</InputAdornment>
						),
					} }
				/>
			</Box>
		</Stack>
	);
};
