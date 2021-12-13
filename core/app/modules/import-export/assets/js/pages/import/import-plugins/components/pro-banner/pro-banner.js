import { useState } from 'react';

import MessageBanner from '../../../../../ui/message-banner/message-banner';
import Button from 'elementor-app/ui/molecules/button';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Dialog from 'elementor-app/ui/dialog/dialog';

import usePlugins from '../../../../../hooks/use-plugins';

import './pro-banner.scss';

export default function ProBanner( { status, onRefresh } ) {
	const { PLUGIN_STATUS_MAP } = usePlugins( { preventFetchOnLoad: true } );

	if ( PLUGIN_STATUS_MAP.INACTIVE === status ) {
		return null;
	}

	const [ isPendingInstallation, setIsPendingInstallation ] = useState( false ),
		[ showInfoDialog, setShowInfoDialog ] = useState( false ),
		isActiveNotConnected = PLUGIN_STATUS_MAP.ACTIVE === status && elementorAppConfig.hasOwnProperty( 'is_license_connected' ) && ! elementorAppConfig.is_license_connected,
		isActive = PLUGIN_STATUS_MAP.ACTIVE === status,
		attrs = {},
		onDialogDismiss = () => setShowInfoDialog( false ),
		onDialogApprove = () => {
			window.open( 'https://go.elementor.com/go-pro-import-export', '_blank' );

			setShowInfoDialog( false );
			setIsPendingInstallation( true );
		};

	if ( isPendingInstallation ) {
		attrs.heading = __( 'Importing with Elementor Pro', 'elementor' );
		attrs.description = [
			__( 'In a moment you’ll be redirected to install and activate Elementor Pro.', 'elementor' ),
			__( 'When you’re done, come back here and refresh this page.', 'elementor' ),
		];
		attrs.button = <Button text={ __( 'Refresh', 'elementor' ) } onClick={ onRefresh } variant="outlined" color="primary" />;
	} else if ( isActiveNotConnected ) {
		attrs.heading = __( 'Connect & Activate Elementor Pro', 'elementor' );
		attrs.description = __( "Without Elementor Pro, importing components like templates, widgets and popups won't work.", 'elementor' );
		attrs.button = <GoProButton text={ __( 'Connect & Activate', 'elementor' ) } url={ elementorAppConfig.license_url } />;
	} else if ( isActive ) {
		attrs.description = __( 'Elementor Pro is installed & Activated', 'elementor' );
	} else {
		attrs.heading = __( 'Install Elementor Pro', 'elementor' );
		attrs.description = __( "Without Elementor Pro, importing components like templates, widgets and popups won't work.", 'elementor' );
		attrs.button = <GoProButton onClick={ () => setShowInfoDialog( true ) } />;
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
