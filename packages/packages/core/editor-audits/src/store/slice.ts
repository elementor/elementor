import { __createSlice, type PayloadAction } from '@elementor/store';

import { type PageAuditReport } from '../types';

type SliceState = {
	status: 'idle' | 'loading' | 'error' | 'ready';
	report: PageAuditReport | null;
	error: string | null;
};

const initialState: SliceState = { status: 'idle', report: null, error: null };

export const slice = __createSlice( {
	name: 'audits',
	initialState,
	reducers: {
		runStarted( state ) {
			state.status = 'loading';
			state.error = null;
		},
		runSucceeded( state, action: PayloadAction< PageAuditReport > ) {
			state.status = 'ready';
			state.report = action.payload;
		},
		runFailed( state, action: PayloadAction< string > ) {
			state.status = 'error';
			state.error = action.payload;
		},
		runAborted( state ) {
			state.status = state.report ? 'ready' : 'idle';
		},
		reportRestored( state, action: PayloadAction< PageAuditReport > ) {
			state.status = 'ready';
			state.report = action.payload;
			state.error = null;
		},
		reportCleared( state ) {
			state.status = 'idle';
			state.report = null;
			state.error = null;
		},
	},
} );

export type AuditsSliceState = SliceState;
