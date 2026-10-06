import { ALL_CATEGORIES } from '../../constants';
import { type AuditMeta, type AuditResult, type AuditRun, type PageAuditReport } from '../../types';
import { countSeverities } from '../severity-counts';

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

describe( 'countSeverities', () => {
	it( 'excludes zero-weight audits from severity counts', () => {
		// Arrange.
		const report = makeReport( [ failedRun( 'real-check', 1 ), failedRun( 'suggestion', 0 ) ] );

		// Act.
		const counts = countSeverities( report, 'compliance' );

		// Assert.
		expect( counts.info ).toBe( 1 );
	} );
} );
