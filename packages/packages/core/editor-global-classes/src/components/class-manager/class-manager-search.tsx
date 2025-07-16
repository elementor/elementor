import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type ClassMangerSearchProps = {
	searchValue: string;
	onChange: ( value: string ) => void;
};

export const ClassManagerSearch = ( { searchValue, onChange }: ClassMangerSearchProps ) => (
	<Stack direction="row" gap={ 0.5 } sx={ { width: '100%' } }>
		<Box sx={ { flexGrow: 1 } }>
			<TextField
				role={ 'search' }
				fullWidth
				size={ 'tiny' }
				value={ searchValue }
				placeholder={ __( 'Search', 'elementor' ) }
				onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => onChange( e.target.value ) }
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
