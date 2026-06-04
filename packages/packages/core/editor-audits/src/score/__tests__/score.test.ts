import { type AuditMeta, type AuditResult, type AuditRun } from '../../types';
import { computeReport } from '../score';

function auditMeta( id: string, categories: AuditMeta[ 'categories' ], weight = 10 ): AuditMeta {
	return {
		id,
		title: id,
		description: '',
		fixHint: '',
		categories,
		severity: 'warning',
		weight,
	};
}

function auditRun( meta: AuditMeta, result: AuditResult ): AuditRun {
	return { audit: meta, result };
}

describe( 'computeReport', () => {
	it( 'per-category score = passed weight / total weight × 100', () => {
		// Arrange.
		const results: AuditRun[] = [
			auditRun( auditMeta( 'a', [ 'seo' ], 10 ), { status: 'pass' } ),
			auditRun( auditMeta( 'b', [ 'seo' ], 10 ), { status: 'fail', violations: [] } ),
		];

		// Act.
		const report = computeReport( 1, results );

		// Assert.
		expect( report.categories.seo.score ).toBe( 50 );
		expect( report.categories.seo.failed ).toBe( 1 );
		expect( report.categories.seo.total ).toBe( 2 );
	} );

	it( 'overall = mean of populated category scores', () => {
		// Arrange.
		const results: AuditRun[] = [
			auditRun( auditMeta( 'a', [ 'seo' ], 10 ), { status: 'pass' } ),
			auditRun( auditMeta( 'b', [ 'performance' ], 10 ), { status: 'fail', violations: [] } ),
		];

		// Act.
		const report = computeReport( 1, results );

		// Assert.
		expect( report.overall ).toBe( 50 );
	} );

	it( 'skipped audits are excluded from totals', () => {
		// Arrange.
		const results: AuditRun[] = [
			auditRun( auditMeta( 'a', [ 'seo' ], 10 ), { status: 'pass' } ),
			auditRun( auditMeta( 'b', [ 'seo' ], 10 ), { status: 'skipped', reason: 'evaluator-not-registered' } ),
		];

		// Act.
		const report = computeReport( 1, results );

		// Assert.
		expect( report.categories.seo.total ).toBe( 1 );
		expect( report.categories.seo.score ).toBe( 100 );
	} );

	it( 'returns 100 for a category with all passes', () => {
		const results: AuditRun[] = [ auditRun( auditMeta( 'a', [ 'accessibility' ], 5 ), { status: 'pass' } ) ];
		expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 100 );
	} );

	it( 'returns 0 for a category with all fails', () => {
		const results: AuditRun[] = [
			auditRun( auditMeta( 'a', [ 'accessibility' ], 5 ), { status: 'fail', violations: [] } ),
		];
		expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 0 );
	} );

	it( 'audit weight matters in score', () => {
		const results: AuditRun[] = [
			auditRun( auditMeta( 'a', [ 'seo' ], 9 ), { status: 'pass' } ),
			auditRun( auditMeta( 'b', [ 'seo' ], 1 ), { status: 'fail', violations: [] } ),
		];

		expect( computeReport( 1, results ).categories.seo.score ).toBe( 90 );
	} );
} );
