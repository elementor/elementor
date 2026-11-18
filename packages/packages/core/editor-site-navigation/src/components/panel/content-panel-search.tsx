import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';

export default function ContentPanelSearch() {
	const { searchQuery, setSearchQuery } = useContentPanelCoordinator();

	return (
		<Box sx={ { px: 2, pt: 1, pb: 1 } }>
			<TextField
				fullWidth
				role="search"
				size="tiny"
				value={ searchQuery }
				placeholder={ __( 'Search', 'elementor' ) }
				onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => setSearchQuery( event.target.value ) }
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