import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Alert, Button } from '@elementor/ui';
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
		sx={ { m: 2, mt: 1, pt: 0.5, pb: 0.5 } }
	>
		{ message }
		<Button
			size={ 'tiny' }
			variant={ 'text' }
			color={ 'promotion' }
			target="_blank"
			href={ upgradeUrl }
			rel="noopener noreferrer"
			startIcon={ <CrownFilledIcon fontSize="tiny" /> }
		>
			{ __( 'Upgrade now', 'elementor' ) }
		</Button>
	</Alert>
);
