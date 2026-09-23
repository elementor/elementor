import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../types';
import AuditStatusesSection from '../audit-statuses-section';

function auditRun( id: string, result: AuditResult ): AuditRun {
	const audit: AuditMeta = {
		id,
		title: id,
		description: '',
		fixHint: '',
		categories: [],
		severity: 'error',
		weight: 1,
	};

	return { audit, result };
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	return { documentId: 1, runAt: 0, overall: 0, categories: {} as PageAuditReport[ 'categories' ], auditResults };
}

describe( 'AuditStatusesSection', () => {
	const report = makeReport( [
		auditRun( 'fail-1', { status: 'fail', violations: [ { auditId: 'fail-1', label: 'fail-1' } ] } ),
		auditRun( 'pass-1', { status: 'pass' } ),
		auditRun( 'skipped-1', { status: 'skipped', reason: 'n/a' } ),
	] );

	it.each( [
		[ 'Failed audits', 'fail' ],
		[ 'Passed audits', 'pass' ],
		[ 'Skipped audits', 'skipped' ],
	] as const )( 'clicking the "%s" circle calls onStatusClick with "%s"', ( label, status ) => {
		// Arrange.
		const onStatusClick = jest.fn();
		renderWithTheme( <AuditStatusesSection report={ report } onStatusClick={ onStatusClick } /> );

		// Act.
		fireEvent.click( screen.getByText( label ) );

		// Assert.
		expect( onStatusClick ).toHaveBeenCalledWith( status );
	} );
} );
