import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSearchContext } from '../context';

export const ClassManagerSearch = () => {
	const { inputValue, handleChange } = useSearchContext();
	return (
		<Stack direction="row" gap={ 0.5 } sx={ { width: '100%' } }>
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
								<SearchIcon fontSize={ 'tiny' } />
							</InputAdornment>
						),
					} }
				/>
			</Box>
		</Stack>
	);
};
