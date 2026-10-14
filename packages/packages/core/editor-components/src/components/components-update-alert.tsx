import * as React from 'react';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const UPDATE_PLUGINS_URL = '/wp-admin/plugins.php';

interface ComponentsUpdateAlertProps {
	title: string;
	description: string;
}

export function ComponentsUpdateAlert( { title, description }: ComponentsUpdateAlertProps ) {
	return (
		<Box sx={ { mt: 'auto', position: 'sticky', bottom: 0 } }>
			<Alert
				variant="standard"
				color="info"
				icon={ <InfoCircleFilledIcon fontSize="tiny" /> }
				role="status"
				size="small"
				action={
					<AlertAction
						variant="contained"
						color="info"
						href={ UPDATE_PLUGINS_URL }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Upgrade Now', 'elementor' ) }
					</AlertAction>
				}
				sx={ { m: 2, mt: 1 } }
			>
				<AlertTitle>{ title }</AlertTitle>
				<Typography variant="caption">{ description }</Typography>
			</Alert>
		</Box>
	);
}
