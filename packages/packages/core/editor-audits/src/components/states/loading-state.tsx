import * as React from 'react';
import { Box, CircularProgress, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function LoadingState() {
	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 4 } }>
			<CircularProgress size={ 32 } />
			<Typography variant="body2">{ __( 'Auditing page…', 'elementor' ) }</Typography>
		</Box>
	);
}
