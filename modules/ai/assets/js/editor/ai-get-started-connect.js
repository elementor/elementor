import React from 'react';
import Connect from './pages/connect';
import GetStarted from './pages/get-started';
import useUserInfo from './hooks/use-user-info';
import Loader from './components/loader';
import { onConnect } from './utils/editor-integration';
import PropTypes from 'prop-types';
import { WizardDialogWrapper } from './components/wizard-dialog-wrapper';

export const AiGetStartedConnect = ( { onClose } ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData } = useUserInfo();

	if ( isLoading ) {
		return (
			<WizardDialogWrapper onClose={ onClose } >
				<Loader BoxProps={ { sx: { px: 3 } } } />
			</WizardDialogWrapper>
		);
	}

	if ( ! isConnected ) {
		return (
			<WizardDialogWrapper onClose={ onClose } >
				<Connect
					connectUrl={ connectUrl }
					onSuccess={ ( data ) => {
						onConnect( data );
						fetchData();
					} }
				/>
			</WizardDialogWrapper>
		);
	}

	if ( ! isGetStarted ) {
		return (
			<WizardDialogWrapper onClose={ onClose } >
				<GetStarted onSuccess={ fetchData } />
			</WizardDialogWrapper>
		);
	}
};

AiGetStartedConnect.propTypes = {
	onClose: PropTypes.func.isRequired,
};
