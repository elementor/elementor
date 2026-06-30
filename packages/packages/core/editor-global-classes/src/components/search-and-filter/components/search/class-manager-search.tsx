import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { trackGlobalClasses, type TrackingEvent } from '../../../../utils/tracking';
import { useSearchAndFilters } from '../../context';

export const ClassManagerSearch = () => {
	const {
		search: { inputValue, handleChange },
	} = useSearchAndFilters();

	return (
		<Stack direction="row" gap={ 0.5 } sx={ { width: '100%' } }>
			<Box sx={ { flexGrow: 1 } }>
				<TextField
					role={ 'search' }
					fullWidth
					size={ 'tiny' }
					value={ inputValue }
					onFocus={ () => {
						trackGlobalClasses( {
							event: 'classManagerSearched',
						} as TrackingEvent );
					} }
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
