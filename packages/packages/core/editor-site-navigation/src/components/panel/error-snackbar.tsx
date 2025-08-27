import * as React from 'react';
import { Alert, Snackbar, Typography } from '@elementor/ui';

type Props = {
	open: boolean;
	onClose: () => void;
};

const ErrorSnackbar = ( { open, onClose }: Props ) => {
	return (
		<Snackbar
			open={ open }
			onClose={ onClose }
			anchorOrigin={ {
				vertical: 'bottom',
				horizontal: 'left',
			} }
		>
			<Alert onClose={ onClose } severity="error" sx={ { width: '100%' } }>
				<Typography
					component="span"
					sx={ {
						fontWeight: 'bold',
					} }
				>
					We couldn’t complete the action.
				</Typography>{ ' ' }
				Please try again
			</Alert>
		</Snackbar>
	);
};

export default ErrorSnackbar;
