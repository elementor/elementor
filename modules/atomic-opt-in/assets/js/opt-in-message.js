import { Snackbar, SnackbarContent, Stack, Alert, IconButton } from '@elementor/ui';
import { CircleCheckFilledIcon, XIcon } from '@elementor/icons';

export const Message = ( { children, severity = 'message', onClose } ) => {
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
				<SnackbarContent message={
					<Stack direction="row" alignItems="center" gap={ 1.25 }>
						<CircleCheckFilledIcon />
						{ children }
						<IconButton color="inherit" onClick={ onClose }>
							<XIcon fontSize="small" />
						</IconButton>
					</Stack>
				} />
			) }
		</Snackbar>
	);
};

Message.propTypes = {
	children: PropTypes.node,
	severity: PropTypes.oneOf( [ 'message', 'success', 'warning', 'error' ] ),
	onClose: PropTypes.func,
};
