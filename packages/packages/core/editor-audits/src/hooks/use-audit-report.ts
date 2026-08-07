import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { runPageAudit } from '../runner';
import { type GlobalState, selectError, selectReport, selectStatus, slice } from '../store';

export function useAuditReport() {
	const status = useSelector( ( state: GlobalState ) => selectStatus( state ) );
	const report = useSelector( ( state: GlobalState ) => selectReport( state ) );
	const error = useSelector( ( state: GlobalState ) => selectError( state ) );
	const dispatch = useDispatch();

	const run = async ( documentId: number ) => {
		dispatch( slice.actions.runStarted() );

		try {
			const nextReport = await runPageAudit( documentId );
			dispatch( slice.actions.runSucceeded( nextReport ) );
		} catch ( e ) {
			dispatch( slice.actions.runFailed( e instanceof Error ? e.message : 'Unknown error' ) );
		}
	};

	return { status, report, error, run };
}
