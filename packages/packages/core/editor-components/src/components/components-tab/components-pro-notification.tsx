import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const UPGRADE_URL = 'https://go.elementor.com/go-pro-components-create/';

export function ComponentsProNotification() {
	return (
		<Box sx={ { mt: 'auto' } }>
			<Alert
				variant="standard"
				color="promotion"
				icon={ <CrownFilledIcon fontSize="tiny" /> }
				role="status"
				size="small"
				action={
					<AlertAction
						variant="contained"
						color="promotion"
						href={ UPGRADE_URL }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Upgrade Now', 'elementor' ) }
					</AlertAction>
				}
				sx={ { m: 2, mt: 1 } }
			>
				<AlertTitle>{ __( 'Create New Components', 'elementor' ) }</AlertTitle>
				<Typography variant="caption">
					{ __( 'Your Pro subscription has expired. Reactivate to enable components again.', 'elementor' ) }
				</Typography>
			</Alert>
		</Box>
	);
}
