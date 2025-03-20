import { Snackbar, Alert } from '@elementor/ui';

export const Message = ( { children, severity = 'warning', onClose } ) => {
	return (
		<Snackbar
			open
			autoHideDuration={ 4000 }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
			onClose={ onClose }
		>
			<Alert
				variant="filled"
				severity={ severity }
				onClose={ onClose }
			>
				{ children }
			</Alert>
		</Snackbar>
	);
};

Message.propTypes = {
	children: PropTypes.node,
	severity: PropTypes.oneOf( [ 'success', 'warning', 'error' ] ),
	onClose: PropTypes.func,
};
