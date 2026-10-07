import { __createSlice, type PayloadAction } from '@elementor/store';

import { type PageAuditReport } from '../types';

type SliceState = {
	status: 'idle' | 'loading' | 'error' | 'ready';
	report: PageAuditReport | null;
	error: string | null;
	isStale: boolean;
};

const initialState: SliceState = { status: 'idle', report: null, error: null, isStale: false };

export const slice = __createSlice( {
	name: 'audits',
	initialState,
	reducers: {
		runStarted( state ) {
			state.status = 'loading';
			state.error = null;
			state.isStale = false;
		},
		runSucceeded( state, action: PayloadAction< PageAuditReport > ) {
			state.status = 'ready';
			state.report = action.payload;
			state.isStale = false;
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
			state.isStale = false;
		},
		reportCleared( state ) {
			state.status = 'idle';
			state.report = null;
			state.error = null;
			state.isStale = false;
		},
		reportStale( state ) {
			if ( state.report ) {
				state.isStale = true;
			}
		},
	},
} );

export type AuditsSliceState = SliceState;
