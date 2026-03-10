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
						{ __( 'Upgrade now', 'elementor' ) }
					</AlertAction>
				}
				sx={ { m: 2, mt: 1 } }
			>
				<AlertTitle>{ __( 'Create new components', 'elementor' ) }</AlertTitle>
				<Typography variant="caption">
					{ __( 'Creating new components requires an active Pro subscription.', 'elementor' ) }
				</Typography>
			</Alert>
		</Box>
	);
}
