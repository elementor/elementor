import { useState } from 'react';

import MessageBanner from '../../../../../ui/message-banner/message-banner';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Dialog from 'elementor-app/ui/dialog/dialog';

import usePlugins from '../../../../../hooks/use-plugins';

import './pro-banner.scss';

export default function ProBanner( { status, onRefresh } ) {
	const { PLUGIN_STATUS_MAP } = usePlugins( { preventFetchOnLoad: true } );

	if ( PLUGIN_STATUS_MAP.INACTIVE === status ) {
		return null;
	}

	const [ showInfoDialog, setShowInfoDialog ] = useState( false ),
		isActive = PLUGIN_STATUS_MAP.ACTIVE === status,
		attrs = {},
		openGoProExternalPage = () => window.open( 'https://go.elementor.com/go-pro-import-export', '_blank' ),
		onDialogDismiss = () => setShowInfoDialog( false ),
		onDialogApprove = () => {
			setShowInfoDialog( false );

			onRefresh();
		};

	if ( isActive ) {
		attrs.description = __( 'Elementor Pro is installed & Activated', 'elementor' );
	} else {
		attrs.heading = __( 'Install Elementor Pro', 'elementor' );
		attrs.description = __( "Without Elementor Pro, importing components like templates, widgets and popups won't work.", 'elementor' );
		attrs.button = <GoProButton onClick={ () => {
			setShowInfoDialog( true );

			openGoProExternalPage();
		} } />;
	}

	return (
		<>
			<MessageBanner { ...attrs } />

			{
				showInfoDialog &&
				<Dialog
					title={ __( 'Importing with Elementor Pro', 'elementor' ) }
					text={ __( 'In a moment you’ll be redirected to install and activate Elementor Pro. When you’re done, come back here and refresh this page.', 'elementor' ) }
					approveButtonColor="primary"
					approveButtonText={ __( 'Got it', 'elementor' ) }
					approveButtonOnClick={ onDialogApprove }
					dismissButtonText={ __( 'Close', 'elementor' ) }
					dismissButtonOnClick={ onDialogDismiss }
					onClose={ onDialogDismiss }
				/>
			}
		</>
	);
}

ProBanner.propTypes = {
	status: PropTypes.string,
	onRefresh: PropTypes.func,
};

ProBanner.defaultProps = {
	status: '',
};
