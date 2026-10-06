import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../../constants';
import { type AuditMeta, type AuditRun, type PageAuditReport } from '../../../types';
import AllAuditsPage from '../all-audits-page';

jest.mock( '@elementor/editor-floating-panels', () => ( {
	useFloatingPanelZIndex: jest.fn( () => 1000 ),
} ) );

function auditMeta( id: string ): AuditMeta {
	return {
		id,
		title: id,
		description: '',
		fixHint: '',
		categories: [ 'compliance' ],
		severity: 'info',
		weight: 5,
	};
}

function failedRun( id: string ): AuditRun {
	return {
		audit: auditMeta( id ),
		result: { status: 'fail', violations: [ { auditId: id, label: `${ id } violation` } ] },
	};
}

function passedRun( id: string ): AuditRun {
	return { audit: auditMeta( id ), result: { status: 'pass' } };
}

function skippedRun( id: string ): AuditRun {
	return { audit: auditMeta( id ), result: { status: 'skipped', reason: 'Not applicable' } };
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	return {
		documentId: 1,
		runAt: 0,
		overall: 0,
		categories: Object.fromEntries(
			ALL_CATEGORIES.map( ( c ) => [ c, { score: 0, failed: 0, total: 0 } ] )
		) as PageAuditReport[ 'categories' ],
		auditResults,
	};
}

function rowChevronLabel( title: string ) {
	// eslint-disable-next-line testing-library/no-node-access -- the row's chevron button has no accessible link to its title besides DOM structure.
	const header = screen.getByText( title ).parentElement?.parentElement;
	return header?.querySelector( 'button[aria-label]' )?.getAttribute( 'aria-label' );
}

describe( 'AllAuditsPage', () => {
	it( 'collapses the previously expanded card when a card in another status group is expanded', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'audit-fail' ),
			passedRun( 'audit-pass' ),
			skippedRun( 'audit-skip' ),
		] );
		renderWithTheme( <AllAuditsPage report={ report } onBack={ jest.fn() } /> );

		// Act.
		fireEvent.click( screen.getByText( 'audit-fail' ) );

		// Assert.
		expect( rowChevronLabel( 'audit-fail' ) ).toBe( 'Collapse' );
		expect( rowChevronLabel( 'audit-pass' ) ).toBe( 'Expand' );
		expect( rowChevronLabel( 'audit-skip' ) ).toBe( 'Expand' );

		// Act.
		fireEvent.click( screen.getByText( 'audit-skip' ) );

		// Assert.
		expect( rowChevronLabel( 'audit-fail' ) ).toBe( 'Expand' );
		expect( rowChevronLabel( 'audit-pass' ) ).toBe( 'Expand' );
		expect( rowChevronLabel( 'audit-skip' ) ).toBe( 'Collapse' );
	} );
} );
