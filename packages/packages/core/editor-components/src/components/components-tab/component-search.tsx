import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSearch } from './search-provider';

export const ComponentSearch = () => {
	const { inputValue, handleChange } = useSearch();

	return (
		<Stack direction="row" gap={ 0.5 } sx={ { width: '100%', px: 2, py: 1.5 } }>
			<Box sx={ { flexGrow: 1 } }>
				<TextField
					role={ 'search' }
					fullWidth
					size={ 'tiny' }
					value={ inputValue }
					placeholder={ __( 'Search', 'elementor' ) }
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
					InputProps={ {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize={ 'small' } />
							</InputAdornment>
						),
					} }
				/>
			</Box>
		</Stack>
	);
};
