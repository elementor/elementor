import { useNavigate } from '@reach/router';

import Dialog from 'elementor-app/ui/dialog/dialog';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useAction from 'elementor-app/hooks/use-action';

const messagesContent = {
		general: {
			text: __( 'Nothing to worry about, just try again. If the problem continues, head over to the Help Center.', 'elementor' ),
		},
		'zip-archive-module-not-installed': {
			text: __( 'Install a PHP zip on your server or contact your site host.', 'elementor' ),
		},
		'manifest-error': {
			text: __( 'There is an error with the manifest file. Try importing again with a new kit file.', 'elementor' ),
		},
		'no-write-permissions': {
			text: __( 'Elementor is not authorized to read or write from this file. Contact your site host.', 'elementor' ),
		},
		'plugin-installation-permissions-error': {
			text: __( 'This kit requires new plugin installation. Unfortunately, you do not have permissions to install new plugins. Contact your site host.', 'elementor' ),
		},
	},
	dialogTitle = __( 'Something went wrong.', 'elementor' ),
	tryAgainText = __( 'Try Again', 'elementor' );

export default function ProcessFailedDialog( { errorType, onApprove, onDismiss, approveButton, dismissButton } ) {
	const action = useAction(),
		navigate = useNavigate(),
		{ referrer } = useQueryParams().getAll(),
		error = 'string' === typeof errorType && messagesContent[ errorType ] ? errorType : 'general',
		{ text } = messagesContent[ error ],
		isTryAgainAction = 'general' === error && onApprove,
		handleOnApprove = () => {
			/*
			* When the errorType is general, there should be an option to trigger the onApprove function.
			* All other error messages should open the learn-more link.
			*/
			if ( isTryAgainAction ) {
				onApprove();
			} else {
				window.open( 'https://elementor.com/help/how-to-fix-common-errors-with-import-export/', '_blank' );
			}
		},
		handleOnDismiss = () => {
			if ( 'general' === error && onDismiss ) {
				onDismiss();
			} else if ( 'kit-library' === referrer ) {
				navigate( '/kit-library' );
			} else {
				action.backToDashboard();
			}
		};

	return (
		<Dialog
			title={ dialogTitle }
			text={ text }
			approveButtonColor="link"
			approveButtonText={ isTryAgainAction ? tryAgainText : approveButton }
			approveButtonOnClick={ handleOnApprove }
			dismissButtonText={ dismissButton }
			dismissButtonOnClick={ handleOnDismiss }
			onClose={ handleOnDismiss }
		/>
	);
}

ProcessFailedDialog.propTypes = {
	onApprove: PropTypes.func,
	onDismiss: PropTypes.func,
	errorType: PropTypes.string,
	approveButton: PropTypes.string,
	dismissButton: PropTypes.string,
};

ProcessFailedDialog.defaultProps = {
	errorType: 'general',
	approveButton: __( 'Learn More', 'elementor' ),
	dismissButton: __( 'Close', 'elementor' ),
};
