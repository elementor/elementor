import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

interface ComponentsUpgradeAlertProps {
	title: string;
	description: string;
	upgradeUrl: string;
}

export function ComponentsUpgradeAlert( { title, description, upgradeUrl }: ComponentsUpgradeAlertProps ) {
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
						href={ upgradeUrl }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Upgrade now', 'elementor' ) }
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
