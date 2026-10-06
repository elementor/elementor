import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../../types';
import CategoryPage from '../category-page';

function auditMeta( id: string, weight: number ): AuditMeta {
	return {
		id,
		title: id,
		description: '',
		fixHint: '',
		categories: [ 'compliance' ],
		severity: 'info',
		weight,
	};
}

function failedRun( id: string, weight: number ): AuditRun {
	const result: AuditResult = { status: 'fail', violations: [ { auditId: id, label: id } ] };
	return { audit: auditMeta( id, weight ), result };
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
} );
