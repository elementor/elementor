import { type AuditDescriptor, type AuditResult } from '../../types';
import { computeReport } from '../score';

function descriptor( id: string, categories: AuditDescriptor[ 'categories' ], weight = 10 ): AuditDescriptor {
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

describe( 'computeReport', () => {
	it( 'per-category score = passed weight / total weight × 100', () => {
		// Arrange.
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
			{ descriptor: descriptor( 'b', [ 'seo' ], 10 ), result: { status: 'fail', violations: [] } },
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
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
			{ descriptor: descriptor( 'b', [ 'performance' ], 10 ), result: { status: 'fail', violations: [] } },
		];

		// Act.
		const report = computeReport( 1, results );

		// Assert.
		expect( report.overall ).toBe( 50 );
	} );

	it( 'skipped audits are excluded from totals', () => {
		// Arrange.
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
			{
				descriptor: descriptor( 'b', [ 'seo' ], 10 ),
				result: { status: 'skipped', reason: 'evaluator-not-registered' },
			},
		];

		// Act.
		const report = computeReport( 1, results );

		// Assert.
		expect( report.categories.seo.total ).toBe( 1 );
		expect( report.categories.seo.score ).toBe( 100 );
	} );

	it( 'returns 100 for a category with all passes', () => {
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'accessibility' ], 5 ), result: { status: 'pass' } },
		];
		expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 100 );
	} );

	it( 'returns 0 for a category with all fails', () => {
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'accessibility' ], 5 ), result: { status: 'fail', violations: [] } },
		];
		expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 0 );
	} );

	it( 'audit weight matters in score', () => {
		const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
			{ descriptor: descriptor( 'a', [ 'seo' ], 9 ), result: { status: 'pass' } },
			{ descriptor: descriptor( 'b', [ 'seo' ], 1 ), result: { status: 'fail', violations: [] } },
		];

		expect( computeReport( 1, results ).categories.seo.score ).toBe( 90 );
	} );
} );
