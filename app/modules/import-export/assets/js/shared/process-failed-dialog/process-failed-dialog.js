import { useEffect } from 'react';
import { useNavigate } from '@reach/router';

import Dialog from 'elementor-app/ui/dialog/dialog';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useAction from 'elementor-app/hooks/use-action';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

const messagesContent = {
	general: {
		title: __( 'Unable to download the Kit', 'elementor' ),
		text: <>
			{ __( 'We couldn’t download the Kit due to technical difficulties on our part. Try again and if the problem persists contact ', 'elementor' ) }
			<InlineLink url="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</InlineLink>
		</>,
	},
	'zip-archive-module-missing': {
		title: __( 'Couldn’t handle the Kit', 'elementor' ),
		text: __( 'Seems like your server is missing the PHP zip module. Install it on your server or contact your site host for further instructions.', 'elementor' ),
	},
	'invalid-zip-file': {
		title: __( 'Couldn’t use the Kit', 'elementor' ),
		text: <>
			{ __( 'Seems like there is a problem with the Kit’s files. Try installing again and if the problem persists contact ', 'elementor' ) }
			<InlineLink url="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</InlineLink>
		</>,
	},
	timeout: {
		title: __( 'Unable to download the Kit', 'elementor' ),
		text: <>
			{ __( 'It took too much time to download your Kit and we were unable to complete the process. If all the Kit’s parts don’t appear in ', 'elementor' ) }
			<InlineLink url={ elementorAppConfig.pages_url } >
				{ __( 'Pages', 'elementor' ) }
			</InlineLink>
			{ __( ', try again and if the problem persists contact ', 'elementor' ) }
			<InlineLink url="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</InlineLink>
		</>,
	},
	'invalid-kit-library-zip-error': {
		title: __( 'Unable to download the Kit', 'elementor' ),
		text: <>
			{ __( 'We couldn’t download the Kit due to technical difficulty on our part. Try again in a few minutes and if the problem persists contact ', 'elementor' ) }
			<InlineLink url="https://my.elementor.com/support-center/">
				{ __( 'Support', 'elementor' ) }
			</InlineLink>
		</>,
	},
	'no-write-permissions': {
		title: __( 'Couldn’t access the file', 'elementor' ),
		text: __( 'Seems like Elementor isn’t authorized to access relevant files for installing this Kit. Contact your site host to get permission.', 'elementor' ),
	},
	'plugin-installation-permissions-error': {
		title: __( 'Couldn’t install the Kit', 'elementor' ),
		text: __( 'The Kit includes plugins you don’t have permission to install. Contact your site admin to change your permissions.', 'elementor' ),
	},
	'third-party-error': {
		title: __( 'Unable to download the Kit', 'elementor' ),
		text: __( 'This is due to a conflict with one or more third-party plugins already active on your site. Try disabling them, and then give the download another go.', 'elementor' ),
	},
	'domdocument-missing': {
		title: __( 'Unable to download the Kit', 'elementor' ),
		text: __( 'This download requires the \'DOMDocument\' PHP extension, which we couldn’t detect on your server. Enable this extension, or get in touch with your hosting service for support, and then give the download another go.', 'elementor' ),
	},
};

export default function ProcessFailedDialog( { errorType, onApprove, onDismiss, approveButton, dismissButton, onModalClose, onError, onLearnMore } ) {
	const action = useAction(),
		navigate = useNavigate(),
		{ referrer } = useQueryParams().getAll(),
		error = 'string' === typeof errorType && messagesContent[ errorType ] ? errorType : 'general',
		{ title, text } = messagesContent[ error ],
		tryAgainText = __( 'Try Again', 'elementor' ),
		isTryAgainAction = 'general' === error && onApprove,
		handleOnApprove = () => {
			/*
			* When the errorType is general, there should be an option to trigger the onApprove function.
			* All other error messages should open the learn-more link.
			*/
			if ( isTryAgainAction ) {
				onApprove();
			} else {
				window.open( 'https://go.elementor.com/app-import-download-failed', '_blank' );
			}
			onLearnMore?.();
		},
		handleOnDismiss = ( event ) => {
			if ( 'general' === error && onDismiss ) {
				onDismiss();
			} else if ( 'kit-library' === referrer ) {
				onModalClose?.( event );
				navigate( '/kit-library' );
			} else {
				action.backToDashboard();
			}
		};

	useEffect( () => {
		onError?.();
	}, [] );

	return (
		<Dialog
			title={ title }
			text={ text }
			approveButtonColor="link"
			approveButtonText={ isTryAgainAction ? tryAgainText : approveButton }
			approveButtonOnClick={ handleOnApprove }
			dismissButtonText={ dismissButton }
			dismissButtonOnClick={ ( event ) => handleOnDismiss( event ) }
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
	onModalClose: PropTypes.func,
	onError: PropTypes.func,
	onLearnMore: PropTypes.func,
};

ProcessFailedDialog.defaultProps = {
	errorType: 'general',
	approveButton: __( 'Learn More', 'elementor' ),
	dismissButton: __( 'Close', 'elementor' ),
};
