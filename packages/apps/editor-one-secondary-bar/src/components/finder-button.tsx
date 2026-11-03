import * as React from 'react';
import { SearchIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export function FinderButton() {
	return (
		<IconButton aria-label={ __( 'Finder', 'elementor' ) } onClick={ () => window.$e?.route?.( 'finder' ) }>
			<SearchIcon fontSize="small" />
		</IconButton>
	);
}
