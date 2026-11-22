import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function UserLoadError() {
	return (
		<Box sx={ { px: 2, py: 2 } }>
			<Typography variant="body2" color="text.secondary">
				{ __( 'We couldn’t load your content permissions. Try closing and reopening this panel.', 'elementor' ) }
			</Typography>
		</Box>
	);
}