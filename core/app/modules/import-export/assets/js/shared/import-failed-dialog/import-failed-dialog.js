import { useNavigate } from '@reach/router';

import Dialog from 'elementor-app/ui/dialog/dialog';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useAction from 'elementor-app/hooks/use-action';

const messagesContent = {
	general: {
		text: __( 'Nothing to worry about, just try again. If the problem continues, head over to the Help Center.', 'elementor' ),
		approveButton: 'Try Again',
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
};

export default function ImportFailedDialog( props ) {
	const action = useAction(),
		navigate = useNavigate(),
		{ referrer } = useQueryParams().getAll(),
		errorType = messagesContent[ props.errorType ] ? props.errorType : 'general',
		{ title, text, approveButton, dismissButton } = messagesContent[ errorType ],
		onApprove = () => {
			if ( 'general' === errorType && props.onApprove ) {
				props.onApprove();
			} else {
				window.open( 'https://elementor.com/help/how-to-fix-common-errors-with-import-export/', '_blank' );
			}
		},
		onDismiss = () => {
			if ( 'general' === errorType && props.onDismiss ) {
				props.onDismiss();
			} else if ( 'kit-library' === referrer ) {
				navigate( '/kit-library' );
			} else {
				action.backToDashboard();
			}
		};

	return (
		<Dialog
			title={ title || __( 'Something went wrong.', 'elementor' ) }
			text={ text }
			approveButtonColor="link"
			approveButtonText={ approveButton || __( 'Learn More', 'elementor' ) }
			approveButtonOnClick={ onApprove }
			dismissButtonText={ dismissButton || __( 'Close', 'elementor' ) }
			dismissButtonOnClick={ onDismiss }
			onClose={ onDismiss }
		/>
	);
}

ImportFailedDialog.propTypes = {
	onApprove: PropTypes.func,
	onDismiss: PropTypes.func,
	errorType: PropTypes.string,
};

ImportFailedDialog.defaultProps = {
	errorType: 'general',
};
