import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../../types';
import CategoryPage from '../category-page';

jest.mock( '@elementor/editor-floating-panels', () => ( {
	useFloatingPanelZIndex: jest.fn( () => 1000 ),
} ) );

function auditMeta( id: string, weight: number ): AuditMeta {
	return {
		id,
		title: id,
		description: `${ id } description`,
		fixHint: '',
		categories: [ 'compliance' ],
		severity: 'info',
		weight,
	};
}

function failedRun( id: string, weight: number ): AuditRun {
	const result: AuditResult = { status: 'fail', violations: [ { auditId: id, label: `${ id } violation` } ] };
	return { audit: auditMeta( id, weight ), result };
}

function passedRun( id: string ): AuditRun {
	return { audit: auditMeta( id, 0 ), result: { status: 'pass' } };
}

function skippedRun( id: string, reason: string ): AuditRun {
	return { audit: auditMeta( id, 1 ), result: { status: 'skipped', reason } };
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

describe( 'CategoryPage', () => {
	it( 'still shows the Failed audits section and its row when only a zero-weight audit fails', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'scan-for-cookies', 0 ) ] );

		// Act.
		renderWithTheme( <CategoryPage category="compliance" report={ report } onBack={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'Failed audits (0)' ) ).toBeInTheDocument();
		expect( screen.getAllByText( 'scan-for-cookies' ).length ).toBeGreaterThan( 0 );
	} );

	function rowChevronLabel( title: string ) {
		// eslint-disable-next-line testing-library/no-node-access -- the row's chevron button has no accessible link to its title besides DOM structure.
		const header = screen.getByText( title ).parentElement?.parentElement;
		// eslint-disable-next-line testing-library/no-node-access -- see above.
		return header?.querySelector( 'button[aria-label]' )?.getAttribute( 'aria-label' );
	}

	it( 'shows skipped audits for the viewed category', () => {
		// Arrange.
		const report = makeReport( [ skippedRun( 'oversized-images', 'No images' ) ] );

		// Act.
		renderWithTheme( <CategoryPage category="compliance" report={ report } onBack={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'Skipped audits (1)' ) ).toBeInTheDocument();
		expect( screen.getAllByText( 'oversized-images' ).length ).toBeGreaterThan( 0 );
	} );

	it( 'collapses the previously expanded card when a different card is expanded, across failed and passed', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'audit-a', 5 ), passedRun( 'audit-b' ) ] );
		renderWithTheme( <CategoryPage category="compliance" report={ report } onBack={ jest.fn() } /> );

		// Act.
		fireEvent.click( screen.getByText( 'audit-a' ) );

		// Assert.
		expect( rowChevronLabel( 'audit-a' ) ).toBe( 'Collapse' );
		expect( rowChevronLabel( 'audit-b' ) ).toBe( 'Expand' );

		// Act.
		fireEvent.click( screen.getByText( 'audit-b' ) );

		// Assert.
		expect( rowChevronLabel( 'audit-a' ) ).toBe( 'Expand' );
		expect( rowChevronLabel( 'audit-b' ) ).toBe( 'Collapse' );
	} );
} );
