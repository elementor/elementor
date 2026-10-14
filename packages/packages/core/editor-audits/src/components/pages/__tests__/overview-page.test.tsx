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
import OverviewPage from '../overview-page';

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

describe( 'OverviewPage', () => {
	it( 'shows the severity summary counts, all issues heading, and populated category rows', () => {
		// Arrange.
		const report = makeReport( [
			failedRun( 'seo-error', [ 'seo' ], 'error' ),
			failedRun( 'accessibility-info', [ 'accessibility' ], 'info' ),
		] );

		// Act.
		renderWithTheme( <OverviewPage report={ report } onCategoryClick={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'Errors' ) ).toBeInTheDocument();
		expect( screen.getByText( 'All issues' ) ).toBeInTheDocument();
		expect( screen.getByText( 'SEO' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Accessibility' ) ).toBeInTheDocument();
	} );

	it( 'hides categories with no violations', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'seo-error', [ 'seo' ], 'error' ) ] );

		// Act.
		renderWithTheme( <OverviewPage report={ report } onCategoryClick={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'SEO' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Accessibility' ) ).not.toBeInTheDocument();
	} );

	it( 'calls onCategoryClick with the clicked category', () => {
		// Arrange.
		const onCategoryClick = jest.fn();
		const report = makeReport( [ failedRun( 'seo-error', [ 'seo' ], 'error' ) ] );
		renderWithTheme( <OverviewPage report={ report } onCategoryClick={ onCategoryClick } /> );

		// Act.
		fireEvent.click( screen.getByText( 'SEO' ) );

		// Assert.
		expect( onCategoryClick ).toHaveBeenCalledWith( 'seo' );
	} );
} );
