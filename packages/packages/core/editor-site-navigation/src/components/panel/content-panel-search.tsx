import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { Box, InputAdornment, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSiteContentSectionToolbar } from '../../contexts/site-content-section-toolbar';

type Props = {
	searchAriaLabel?: string;
};

export default function ContentPanelSearch( { searchAriaLabel }: Props ) {
	const { searchQuery, setSearchQuery } = useSiteContentSectionToolbar();
	const ariaLabel = searchAriaLabel ?? __( 'Search site content', 'elementor' );

	return (
		<Box component="search" aria-label={ ariaLabel }>
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
