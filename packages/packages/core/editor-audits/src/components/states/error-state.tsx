import * as React from 'react';
import { Box, Button, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	message: string;
	onRetry: () => void;
};

export default function ErrorState( { message, onRetry }: Props ) {
	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 4 } }>
			<Typography variant="body2" color="error" textAlign="center">
				{ message }
			</Typography>
			<Button variant="contained" size="small" onClick={ onRetry }>
				{ __( 'Try again', 'elementor' ) }
			</Button>
		</Box>
	);
}
