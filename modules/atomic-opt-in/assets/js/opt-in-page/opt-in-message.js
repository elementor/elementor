import { Snackbar, SnackbarContent, Stack, Alert, IconButton } from '@elementor/ui';
import { CircleCheckFilledIcon, XIcon } from '@elementor/icons';

export const Message = ( { action, children, severity = 'message', onClose } ) => {
	return (
		<Snackbar
			open
			autoHideDuration={ 4000 }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
			onClose={ onClose }
		>
			{ ( 'message' !== severity ) ? (
				<Alert
					variant="filled"
					severity={ severity }
					onClose={ onClose }
				>
					{ children }
				</Alert>
			) : (
				<SnackbarContent
					message={
						<Stack direction="row" gap={ 1.5 } alignItems="center">
							<CircleCheckFilledIcon />
							{ children }
						</Stack>
					}
					action={
						<Stack direction="row" spacing={ 1 } alignItems="center">
							{ action }
							<IconButton color="inherit" size="small" onClick={ onClose }>
								<XIcon fontSize="small" />
							</IconButton>
						</Stack>
					}
				/>
			) }
		</Snackbar>
	);
};

Message.propTypes = {
	action: PropTypes.node,
	children: PropTypes.node,
	severity: PropTypes.oneOf( [ 'message', 'success', 'warning', 'error' ] ),
	onClose: PropTypes.func,
};
