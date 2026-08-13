import * as React from 'react';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import {
	__createStore,
	__deleteStore,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { act, renderHook, waitFor } from '@testing-library/react';

import { runPageAudit } from '../../runner';
import { slice } from '../../store/slice';
import { type PageAuditReport } from '../../types';
import { getPersistedReport, persistReport } from '../../utils/report-storage';
import { SessionExpiredError } from '../../utils/session-expiration';
import { useAuditReport } from '../use-audit-report';

jest.mock( '@elementor/editor-elements', () => ( {
	getCurrentDocumentId: jest.fn(),
} ) );

jest.mock( '../../runner' );
jest.mock( '../../utils/report-storage' );

const DOCUMENT_ID = 1;
const OTHER_DOCUMENT_ID = 2;

function makeReport( documentId: number ): PageAuditReport {
	return {
		documentId,
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

function renderUseAuditReport() {
	const store = __getStore();

	if ( ! store ) {
		throw new Error( 'Store is not initialized' );
	}

	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( StoreProvider, { store, children } );

	return renderHook( () => useAuditReport(), { wrapper } );
}

describe( 'useAuditReport', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getPersistedReport ).mockReturnValue( null );
		jest.mocked( getCurrentDocumentId ).mockReturnValue( DOCUMENT_ID );
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'restores a persisted report for the current document on mount', async () => {
		// Arrange.
		const persisted = makeReport( DOCUMENT_ID );
		jest.mocked( getPersistedReport ).mockReturnValue( persisted );

		// Act.
		const { result } = renderUseAuditReport();

		// Assert.
		await waitFor( () => expect( result.current.status ).toBe( 'ready' ) );
		expect( getPersistedReport ).toHaveBeenCalledWith( DOCUMENT_ID );
		expect( result.current.report ).toEqual( persisted );
	} );

	it( 'does not touch the report when there is nothing persisted for the current document', () => {
		// Act.
		const { result } = renderUseAuditReport();

		// Assert.
		expect( result.current.status ).toBe( 'idle' );
		expect( result.current.report ).toBeNull();
	} );

	it( 'clears a stale report when the current document changes and has no persisted report', async () => {
		// Arrange.
		const persisted = makeReport( DOCUMENT_ID );
		jest.mocked( getPersistedReport ).mockReturnValueOnce( persisted ).mockReturnValue( null );
		const { result, rerender } = renderUseAuditReport();
		await waitFor( () => expect( result.current.status ).toBe( 'ready' ) );

		// Act.
		jest.mocked( getCurrentDocumentId ).mockReturnValue( OTHER_DOCUMENT_ID );
		rerender();

		// Assert.
		await waitFor( () => expect( result.current.status ).toBe( 'idle' ) );
		expect( result.current.report ).toBeNull();
	} );

	it( 'restores the other document report after switching back to it', async () => {
		// Arrange.
		const reportForDocumentOne = makeReport( DOCUMENT_ID );
		const reportForDocumentTwo = makeReport( OTHER_DOCUMENT_ID );
		jest.mocked( getPersistedReport ).mockImplementation( ( documentId: number ) =>
			documentId === DOCUMENT_ID ? reportForDocumentOne : reportForDocumentTwo
		);
		const { result, rerender } = renderUseAuditReport();
		await waitFor( () => expect( result.current.report ).toEqual( reportForDocumentOne ) );

		// Act.
		jest.mocked( getCurrentDocumentId ).mockReturnValue( OTHER_DOCUMENT_ID );
		rerender();

		// Assert.
		await waitFor( () => expect( result.current.report ).toEqual( reportForDocumentTwo ) );
	} );

	it( 'persists the report to storage after a successful run', async () => {
		// Arrange.
		const nextReport = makeReport( DOCUMENT_ID );
		jest.mocked( runPageAudit ).mockResolvedValue( nextReport );
		const { result } = renderUseAuditReport();

		// Act.
		await act( async () => {
			await result.current.run( DOCUMENT_ID );
		} );

		// Assert.
		expect( result.current.report ).toEqual( nextReport );
		expect( persistReport ).toHaveBeenCalledWith( DOCUMENT_ID, nextReport );
	} );

	it( 'does not persist to storage when the run fails', async () => {
		// Arrange.
		jest.mocked( runPageAudit ).mockRejectedValue( new Error( 'boom' ) );
		const { result } = renderUseAuditReport();

		// Act.
		await act( async () => {
			await result.current.run( DOCUMENT_ID );
		} );

		// Assert.
		expect( result.current.status ).toBe( 'error' );
		expect( persistReport ).not.toHaveBeenCalled();
	} );

	it( 'reverts to idle without an error when the session expires and there is no report yet', async () => {
		// Arrange.
		jest.mocked( runPageAudit ).mockRejectedValue( new SessionExpiredError( 'Session expired' ) );
		const { result } = renderUseAuditReport();

		// Act.
		await act( async () => {
			await result.current.run( DOCUMENT_ID );
		} );

		// Assert.
		expect( result.current.status ).toBe( 'idle' );
		expect( result.current.error ).toBeNull();
		expect( persistReport ).not.toHaveBeenCalled();
	} );

	it( 'reverts to the last ready report without an error when the session expires during a re-scan', async () => {
		// Arrange.
		const existingReport = makeReport( DOCUMENT_ID );
		jest.mocked( runPageAudit )
			.mockResolvedValueOnce( existingReport )
			.mockRejectedValueOnce( new SessionExpiredError( 'Session expired' ) );
		const { result } = renderUseAuditReport();
		await act( async () => {
			await result.current.run( DOCUMENT_ID );
		} );
		await waitFor( () => expect( result.current.status ).toBe( 'ready' ) );

		// Act.
		await act( async () => {
			await result.current.run( DOCUMENT_ID );
		} );

		// Assert.
		expect( result.current.status ).toBe( 'ready' );
		expect( result.current.error ).toBeNull();
		expect( result.current.report ).toEqual( existingReport );
	} );
} );
