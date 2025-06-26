import React from 'react';
import { Typography, CircularProgress } from '@elementor/ui';

export default function ExportProcessing( { statusText } ) {
	return (
		<>
			<CircularProgress size={ 60 } />
			<Typography variant="h5" component="h2">
				{ statusText }
			</Typography>
			<Typography variant="body1" color="text.secondary">
				{ __( 'This usually takes a few moments.', 'elementor' ) }
				<br/>
				{ __( "Don't close this window until the process is finished.", 'elementor' ) }
			</Typography>
		</>
	);
} 