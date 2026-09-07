import { ALL_CATEGORIES } from '../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../types';
import { auditStatusDisplayCounts, partitionAuditResults } from '../audit-status-summary';

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

describe( 'partitionAuditResults', () => {
	it( 'still lists a zero-weight failing audit but excludes it from totalViolations', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'real-check', 1 ), failedRun( 'suggestion', 0 ) ] );

		// Act.
		const { failed, totalViolations } = partitionAuditResults( report );

		// Assert.
		expect( failed.map( ( r ) => r.audit.id ) ).toEqual( [ 'real-check', 'suggestion' ] );
		expect( totalViolations ).toBe( 1 );
	} );
} );

describe( 'auditStatusDisplayCounts', () => {
	it( 'excludes zero-weight audits from the fail count', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'real-check', 1 ), failedRun( 'suggestion', 0 ) ] );

		// Act.
		const counts = auditStatusDisplayCounts( report );

		// Assert.
		expect( counts.fail ).toBe( 1 );
	} );
} );
