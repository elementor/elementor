import { useEffect } from 'react';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { runPageAudit } from '../runner';
import { type GlobalState, selectError, selectReport, selectStatus, slice } from '../store';
import { getPersistedReport, persistReport } from '../utils/report-storage';

export function useAuditReport() {
	const status = useSelector( ( state: GlobalState ) => selectStatus( state ) );
	const report = useSelector( ( state: GlobalState ) => selectReport( state ) );
	const error = useSelector( ( state: GlobalState ) => selectError( state ) );
	const dispatch = useDispatch();
	const documentId = getCurrentDocumentId() ?? 0;

	useEffect( () => {
		if ( ! documentId || report?.documentId === documentId ) {
			return;
		}

		const persisted = getPersistedReport( documentId );

		if ( persisted ) {
			dispatch( slice.actions.reportRestored( persisted ) );
		} else if ( report ) {
			dispatch( slice.actions.reportCleared() );
		}
	}, [ documentId, report, dispatch ] );

	const run = async ( documentIdToRun: number ) => {
		dispatch( slice.actions.runStarted() );

		try {
			const nextReport = await runPageAudit( documentIdToRun );
			dispatch( slice.actions.runSucceeded( nextReport ) );
			persistReport( documentIdToRun, nextReport );
		} catch ( e ) {
			dispatch( slice.actions.runFailed( e instanceof Error ? e.message : 'Unknown error' ) );
		}
	};

	return { status, report, error, run };
}
