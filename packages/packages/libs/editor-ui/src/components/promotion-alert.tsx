import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Alert, Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type PromotionAlertProps = {
	message: string;
	upgradeUrl: string;
};

export const PromotionAlert = ( { message, upgradeUrl }: PromotionAlertProps ) => (
	<Alert
		variant="standard"
		color="promotion"
		icon={ false }
		role="dialog"
		aria-label="promotion-alert"
		size="small"
		sx={ { m: 2, mt: 1, mb: 1, pt: 0.25, pb: 1 } }
	>
		{ message }
		<Box
			component="a"
			href={ upgradeUrl }
			target="_blank"
			rel="noopener noreferrer"
			sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 0.5,
				color: 'promotion.main',
			} }
		>
			<CrownFilledIcon fontSize="tiny" />
			{ __( 'Upgrade now', 'elementor' ) }
		</Box>
	</Alert>
);
