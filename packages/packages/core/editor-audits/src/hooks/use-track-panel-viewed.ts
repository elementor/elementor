import { useEffect, useRef, useState } from 'react';
import { useCurrentUser, useSuppressedMessage } from '@elementor/editor-current-user';
import { getHostDocumentId } from '@elementor/editor-elements';
import { __useSelector as useSelector } from '@elementor/store';

import { FIRST_OPEN_MESSAGE_KEY } from '../constants';
import { type GlobalState, selectReport } from '../store';
import { getPersistedReport } from '../utils/report-storage';
import { trackPanelViewed } from '../utils/tracking';

export function useTrackPanelViewed() {
	const { data: currentUser } = useCurrentUser();
	const [ isFirstOpenMessageSuppressed, suppressFirstOpenMessage ] = useSuppressedMessage( FIRST_OPEN_MESSAGE_KEY );
	const report = useSelector( ( state: GlobalState ) => selectReport( state ) );
	const [ hasPriorReport ] = useState( () => {
		const documentId = getHostDocumentId() ?? 0;

		return Boolean( report ) || Boolean( documentId && getPersistedReport( documentId ) );
	} );
	const hasTracked = useRef( false );

	useEffect( () => {
		if ( ! currentUser || hasTracked.current ) {
			return;
		}

		hasTracked.current = true;
		trackPanelViewed( { hasPriorReport, isFirstOpen: ! isFirstOpenMessageSuppressed } );
		suppressFirstOpenMessage();
	}, [ currentUser, hasPriorReport, isFirstOpenMessageSuppressed, suppressFirstOpenMessage ] );
}
