import { useContext } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';

export default function useImportActions() {
	const sharedContext = useContext( SharedContext ),
		navigate = useNavigate(),
		navigateToMainScreen = () => {
			if ( 'kit-library' === sharedContext.data.referrer ) {
				navigate( '/kit-library' );
			} else {
				navigate( '/import' );
			}
		};

	return {
		navigateToMainScreen,
	};
}
