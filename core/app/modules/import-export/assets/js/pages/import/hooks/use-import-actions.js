import { useContext } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';

import useAction from 'elementor-app/hooks/use-action';

export default function useImportActions() {
	const sharedContext = useContext( SharedContext ),
		navigate = useNavigate(),
		{ backToDashboard } = useAction(),
		isCameFromKitLibrary = 'kit-library' === sharedContext.data.referrer,
		navigateToMainScreen = () => {
			if ( isCameFromKitLibrary ) {
				navigate( '/kit-library' );
			} else {
				navigate( '/import' );
			}
		},
		closeApp = () => {
			if ( isCameFromKitLibrary ) {
				navigate( '/kit-library' );
			} else {
				backToDashboard();
			}
		};

	return {
		navigateToMainScreen,
		closeApp,
	};
}
