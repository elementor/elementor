import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../types';
import ReportShell from '../report-shell';

jest.mock( '@elementor/editor-floating-panels', () => ( {
	useFloatingPanelZIndex: jest.fn( () => 1000 ),
} ) );

function auditMeta( id: string ): AuditMeta {
	return { id, title: id, description: '', fixHint: '', categories: [ 'seo' ], severity: 'error', weight: 1 };
}

function failedRun( id: string ): AuditRun {
	const result: AuditResult = { status: 'fail', violations: [ { auditId: id, label: id } ] };
	return { audit: auditMeta( id ), result };
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	return {
		documentId: 1,
		runAt: 0,
		overall: 0,
		categories: Object.fromEntries(
			ALL_CATEGORIES.map( ( category ) => [
				category,
				{ score: 0, failed: 0, total: category === 'seo' ? 1 : 0 },
			] )
		) as PageAuditReport[ 'categories' ],
		auditResults,
	};
}

describe( 'ReportShell', () => {
	it( 'shows the overview page by default', () => {
		// Arrange & Act.
		renderWithTheme( <ReportShell report={ makeReport( [ failedRun( 'seo-error' ) ] ) } /> );

		// Assert.
		expect( screen.getByText( 'All issues' ) ).toBeInTheDocument();
		expect( screen.getByText( 'SEO' ) ).toBeInTheDocument();
	} );

	it( 'navigates to the category page when a category row is clicked, and back to the overview', () => {
		// Arrange.
		renderWithTheme( <ReportShell report={ makeReport( [ failedRun( 'seo-error' ) ] ) } /> );

		// Act.
		fireEvent.click( screen.getByText( 'SEO' ) );

		// Assert.
		expect( screen.getByText( 'Failed audits (1)' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByLabelText( 'Back to all issues' ) );

		// Assert.
		expect( screen.getByText( 'All issues' ) ).toBeInTheDocument();
	} );
} );
