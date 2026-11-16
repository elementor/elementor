import { dispatchCommandAfter } from 'test-utils';
import { __privateSetReady as setReady } from '@elementor/editor-v1-adapters';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { selectIsStale } from '../store/selectors';
import { slice } from '../store/slice';
import { syncReportStaleness } from '../sync-report-staleness';
import { type PageAuditReport } from '../types';

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

describe( 'syncReportStaleness', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();

		setReady( false );
		syncReportStaleness();
		setReady( true );
	} );

	it( 'marks the report as stale when the document becomes modified', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified', { status: true } );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( true );
	} );

	it( 'does not mark the report as stale when the document becomes pristine again', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified', { status: false } );

		// Assert.
		expect( selectIsStale( getState() ) ).toBe( false );
	} );
} );
