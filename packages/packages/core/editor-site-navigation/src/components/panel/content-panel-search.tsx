import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import { contentPanelSearchBoxSx } from './content-panel-chrome';

export default function ContentPanelSearch() {
	const { searchQuery, setSearchQuery } = useContentPanelCoordinator();

	return (
		<Box component="search" sx={ contentPanelSearchBoxSx } aria-label={ __( 'Search site content', 'elementor' ) }>
			<TextField
				fullWidth
				size="tiny"
				value={ searchQuery }
				placeholder={ __( 'Search', 'elementor' ) }
				onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => setSearchQuery( event.target.value ) }
				inputProps={ {
					'aria-label': __( 'Search', 'elementor' ),
				} }
				InputProps={ {
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon fontSize="tiny" />
						</InputAdornment>
					),
				} }
			/>
		</Box>
	);
}