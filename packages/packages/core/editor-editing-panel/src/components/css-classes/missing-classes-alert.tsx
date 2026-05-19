import * as React from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type MissingClassesAlertProps = {
	onDismiss: () => void;
};

export function MissingClassesAlert( { onDismiss }: MissingClassesAlertProps ) {
	return (
		<Alert
			severity="warning"
			onClose={ onDismiss }
			size="small"
			icon={ <AlertTriangleFilledIcon fontSize="tiny" /> }
			sx={ { mt: 1 } }
		>
			<AlertTitle>{ __( 'Some classes are missing', 'elementor' ) }</AlertTitle>
			<Typography variant="caption" textColor="primary">
				{ __( 'A class was removed from your site and is no longer active on this element', 'elementor' ) }
			</Typography>
		</Alert>
	);
}
