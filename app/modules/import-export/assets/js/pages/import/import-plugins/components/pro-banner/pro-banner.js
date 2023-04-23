import { useState } from 'react';

import MessageBanner from '../../../../../ui/message-banner/message-banner';
import GoProButton from 'elementor-app/molecules/go-pro-button';
import Dialog from 'elementor-app/ui/dialog/dialog';

import './pro-banner.scss';

export default function ProBanner( { onRefresh } ) {
	const [ showInfoDialog, setShowInfoDialog ] = useState( false ),
		openGoProExternalPage = () => window.open( 'https://go.elementor.com/go-pro-import-export/', '_blank' ),
		onDialogDismiss = () => setShowInfoDialog( false ),
		onDialogApprove = () => {
			setShowInfoDialog( false );

			onRefresh();
		},
		handleGoPro = () => {
			setShowInfoDialog( true );

			openGoProExternalPage();
		};

	return (
		<>
			<MessageBanner
				heading={ __( 'Install Elementor Pro', 'elementor' ) }
				description={ __( "Without Elementor Pro, importing components like templates, widgets and popups won't work.", 'elementor' ) }
				button={ <GoProButton onClick={ handleGoPro } /> }
			/>

			{
				showInfoDialog &&
				<Dialog
					title={ __( 'Is your Elementor Pro ready?', 'elementor' ) }
					text={ __( 'If you’ve purchased, installed & activated Elementor Pro, we can continue importing all the parts of this site.', 'elementor' ) }
					approveButtonColor="primary"
					approveButtonText={ __( 'Yes', 'elementor' ) }
					approveButtonOnClick={ onDialogApprove }
					dismissButtonText={ __( 'Not yet', 'elementor' ) }
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
