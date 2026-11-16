import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type AuditSeverity, type PageAuditReport } from '../../types';
import SeveritySummaryCards from '../severity-summary-cards';

function auditMeta( id: string, severity: AuditSeverity ): AuditMeta {
	return { id, title: id, description: '', fixHint: '', categories: [ 'seo' ], severity, weight: 1 };
}

function failedRun( id: string, severity: AuditSeverity, violationCount: number ): AuditRun {
	const result: AuditResult = {
		status: 'fail',
		violations: Array.from( { length: violationCount }, ( _, index ) => ( {
			auditId: id,
			label: `${ id }-${ index }`,
		} ) ),
	};
	return { audit: auditMeta( id, severity ), result };
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	return {
		documentId: 1,
		runAt: 0,
		overall: 0,
		categories: Object.fromEntries(
			ALL_CATEGORIES.map( ( category ) => [ category, { score: 0, failed: 0, total: 0 } ] )
		) as PageAuditReport[ 'categories' ],
		auditResults,
	};
}

describe( 'SeveritySummaryCards', () => {
	it( 'shows the Errors, Warnings and Suggestions counts across all categories', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'missing-alt', 'error', 2 ),
			failedRun( 'slow-image', 'warning', 1 ),
			failedRun( 'add-statement', 'info', 3 ),
		] );

		// Act.
		renderWithTheme( <SeveritySummaryCards report={ report } /> );

		// Assert.
		expect( screen.getByText( 'Errors' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Warnings' ) ).toBeInTheDocument();
		expect( screen.getByText( '1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Suggestions' ) ).toBeInTheDocument();
		expect( screen.getByText( '3' ) ).toBeInTheDocument();
	} );

	it( 'shows zero counts when there are no violations', () => {
		// Arrange & Act.
		renderWithTheme( <SeveritySummaryCards report={ makeReport( [] ) } /> );

		// Assert.
		expect( screen.getAllByText( '0' ) ).toHaveLength( 3 );
	} );
} );
