import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ALL_CATEGORIES } from '../../../constants';
import {
	type AuditCategory,
	type AuditMeta,
	type AuditResult,
	type AuditRun,
	type AuditSeverity,
	type PageAuditReport,
} from '../../../types';
import IssuesPage from '../issues-page';

function auditMeta( id: string, categories: AuditCategory[], severity: AuditSeverity ): AuditMeta {
	return { id, title: id, description: '', fixHint: '', categories, severity, weight: 1 };
}

function failedRun( id: string, categories: AuditCategory[], severity: AuditSeverity ): AuditRun {
	const result: AuditResult = { status: 'fail', violations: [ { auditId: id, label: id } ] };
	return { audit: auditMeta( id, categories, severity ), result };
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	const involvedCategories = new Set( auditResults.flatMap( ( run ) => run.audit.categories ) );

	return {
		documentId: 1,
		runAt: 0,
		overall: 0,
		categories: Object.fromEntries(
			ALL_CATEGORIES.map( ( category ) => [
				category,
				{ score: 0, failed: 0, total: involvedCategories.has( category ) ? 1 : 0 },
			] )
		) as PageAuditReport[ 'categories' ],
		auditResults,
	};
}

describe( 'IssuesPage', () => {
	it( 'shows every populated category when "All" is selected', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'seo-error', [ 'seo' ], 'error' ),
			failedRun( 'accessibility-info', [ 'accessibility' ], 'info' ),
		] );

		// Act.
		renderWithTheme(
			<IssuesPage
				report={ report }
				onCategoryClick={ jest.fn() }
				onAllAuditsClick={ jest.fn() }
				onStatusClick={ jest.fn() }
			/>
		);

		// Assert.
		expect( screen.getByText( 'SEO' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Accessibility' ) ).toBeInTheDocument();
	} );

	it( 'hides categories with no violations for the selected severity filter', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'seo-error', [ 'seo' ], 'error' ),
			failedRun( 'accessibility-info', [ 'accessibility' ], 'info' ),
		] );
		renderWithTheme(
			<IssuesPage
				report={ report }
				onCategoryClick={ jest.fn() }
				onAllAuditsClick={ jest.fn() }
				onStatusClick={ jest.fn() }
			/>
		);

		// Act.
		fireEvent.click( screen.getByText( 'Errors' ) );

		// Assert.
		expect( screen.getByText( 'SEO' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Accessibility' ) ).not.toBeInTheDocument();
	} );

	it( 'shows only the selected severity count for a category with multiple severities', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'seo-error', [ 'seo' ], 'error' ),
			failedRun( 'seo-info', [ 'seo' ], 'info' ),
		] );
		renderWithTheme(
			<IssuesPage
				report={ report }
				onCategoryClick={ jest.fn() }
				onAllAuditsClick={ jest.fn() }
				onStatusClick={ jest.fn() }
			/>
		);

		// Act.
		fireEvent.click( screen.getByText( 'Suggestions' ) );

		// Assert.
		expect( screen.getAllByText( '1' ) ).toHaveLength( 1 );
	} );
} );
