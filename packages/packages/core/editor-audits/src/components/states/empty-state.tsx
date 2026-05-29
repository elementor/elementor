import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function EmptyState() {
	return (
		<Box
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1,
				p: 4,
			} }
		>
			<Typography variant="subtitle1">{ __( 'Audit your page', 'elementor' ) }</Typography>
			<Typography variant="body2" color="text.secondary" textAlign="center">
				{ __(
					'Check SEO, accessibility, performance, and health issues. Click "Run page audit" to begin.',
					'elementor'
				) }
			</Typography>
		</Box>
	);
}
