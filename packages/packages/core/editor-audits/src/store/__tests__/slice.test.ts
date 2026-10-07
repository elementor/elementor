import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { type PageAuditReport } from '../../types';
import { selectIsStale, selectReport, selectStatus } from '../selectors';
import { slice } from '../slice';

function makeReport(): PageAuditReport {
	return {
		documentId: 1,
		runAt: 1700000000000,
		overall: 100,
		categories: {
			'best-practices': { score: 100, failed: 0, total: 0 },
			seo: { score: 100, failed: 0, total: 0 },
			accessibility: { score: 100, failed: 0, total: 0 },
			performance: { score: 100, failed: 0, total: 0 },
			compliance: { score: 100, failed: 0, total: 0 },
		},
		auditResults: [],
	};
}

describe( 'audits slice - staleness', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'does not mark the report as stale when there is no report yet', () => {
		// Act.
		dispatch( slice.actions.reportStale() );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
	} );

	it( 'marks an existing report as stale', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );

		// Act.
		dispatch( slice.actions.reportStale() );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( true );
	} );

	it( 'clears staleness when a new run starts', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );
		dispatch( slice.actions.reportStale() );

		// Act.
		dispatch( slice.actions.runStarted() );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
	} );

	it( 'clears staleness when a run succeeds', () => {
		// Arrange.
		const report = makeReport();
		dispatch( slice.actions.runSucceeded( report ) );
		dispatch( slice.actions.reportStale() );

		// Act.
		dispatch( slice.actions.runSucceeded( report ) );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
		expect( selectStatus( getState() ) ).toBe( 'ready' );
		expect( selectReport( getState() ) ).toEqual( report );
	} );

	it( 'clears staleness when a report is restored from storage', () => {
		// Arrange.
		const report = makeReport();
		dispatch( slice.actions.runSucceeded( report ) );
		dispatch( slice.actions.reportStale() );

		// Act.
		dispatch( slice.actions.reportRestored( report ) );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
	} );

	it( 'clears staleness when the report is cleared', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );
		dispatch( slice.actions.reportStale() );

		// Act.
		dispatch( slice.actions.reportCleared() );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
	} );
} );
