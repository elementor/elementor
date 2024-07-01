import React from 'react';
import useUserInfo from './hooks/use-user-info';
import Loader from './components/loader';
import { onConnect } from './utils/editor-integration';
import PropTypes from 'prop-types';
import { WizardDialogWrapper } from './components/wizard-dialog-wrapper';
import ConnectAndGetStarted from './pages/connect/connect-and-get-started';
import { setGetStarted } from './api';

export const AiGetStartedConnect = ( { onClose } ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData } = useUserInfo();

	if ( isLoading ) {
		return (
			<WizardDialogWrapper onClose={ onClose }>
				<Loader BoxProps={ { sx: { px: 3 } } } />
			</WizardDialogWrapper>
		);
	}

	if ( ! isConnected || ! isGetStarted ) {
		return (
			<WizardDialogWrapper onClose={ onClose }>
				<ConnectAndGetStarted
					connectUrl={ connectUrl }
					isConnected={ isConnected }
					getStartedAction={ async () => {
						await setGetStarted();
						fetchData();
					} }
					onSuccess={ async ( data ) => {
						onConnect( data );
						fetchData();
						await setGetStarted();
						fetchData();
					} }
				/>
			</WizardDialogWrapper>
		);
	}
};

AiGetStartedConnect.propTypes = {
	onClose: PropTypes.func.isRequired,
};
