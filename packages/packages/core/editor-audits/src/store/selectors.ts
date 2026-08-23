import { type AuditsSliceState } from './slice';

export type GlobalState = { audits: AuditsSliceState };

export function selectStatus( state: GlobalState ) {
	return state.audits.status;
}

export function selectReport( state: GlobalState ) {
	return state.audits.report;
}

export function selectError( state: GlobalState ) {
	return state.audits.error;
}
