import { type AuditRun, type AuditSeverity, type PageAuditReport } from '../../types';
import { buildRunSummary } from '../build-run-summary';

const OVERALL_SCORE = 72;
const SCORED_WEIGHT = 5;

function makeRun( id: string, severity: AuditSeverity, status: 'pass' | 'fail', weight = SCORED_WEIGHT ): AuditRun {
	return {
		audit: { id, title: id, description: '', fixHint: '', categories: [ 'seo' ], severity, weight },
		result:
			status === 'pass'
				? { status: 'pass' }
				: { status: 'fail', violations: [ { auditId: id, label: 'violation' } ] },
	};
}

function makeReport( auditResults: AuditRun[] ): PageAuditReport {
	return {
		documentId: 1,
		runAt: 1700000000000,
		overall: OVERALL_SCORE,
		categories: {
			'best-practices': { score: 0, failed: 0, total: 0 },
			seo: { score: 0, failed: 0, total: 0 },
			accessibility: { score: 0, failed: 0, total: 0 },
			performance: { score: 0, failed: 0, total: 0 },
			compliance: { score: 0, failed: 0, total: 0 },
		},
		auditResults,
	};
}

describe( 'buildRunSummary', () => {
	it( 'reports success with zero fixes when no check failed', () => {
		// Arrange.
		const report = makeReport( [ makeRun( 'audits/page-title', 'error', 'pass' ) ] );

		// Act.
		const summary = buildRunSummary( report );

		// Assert.
		expect( summary.state ).toBe( 'success' );
		expect( summary.metadata ).toEqual( {
			score: OVERALL_SCORE,
			fix_count: 0,
			error_count: 0,
			warning_count: 0,
			suggestion_count: 0,
			required_fixes: [],
		} );
	} );

	it( 'counts failed checks by severity and maps info to suggestion', () => {
		// Arrange.
		const report = makeReport( [
			makeRun( 'audits/page-title', 'error', 'fail' ),
			makeRun( 'audits/images-too-large', 'warning', 'fail' ),
			makeRun( 'audits/cookie-policy', 'info', 'fail' ),
			makeRun( 'audits/page-excerpt', 'info', 'pass' ),
		] );

		// Act.
		const { metadata } = buildRunSummary( report );

		// Assert.
		expect( metadata.fix_count ).toBe( 3 );
		expect( metadata.error_count ).toBe( 1 );
		expect( metadata.warning_count ).toBe( 1 );
		expect( metadata.suggestion_count ).toBe( 1 );
		expect( metadata.required_fixes ).toEqual( [
			{ check: 'page_title', severity: 'error' },
			{ check: 'images_too_large', severity: 'warning' },
			{ check: 'cookie_policy', severity: 'suggestion' },
		] );
	} );

	it.each( [
		[ 'error', [ 'warning', 'info', 'error' ] ],
		[ 'warning', [ 'info', 'warning' ] ],
		[ 'suggestion', [ 'info' ] ],
	] as const )( 'resolves the %s state from the highest failing severity', ( expectedState, severities ) => {
		// Arrange.
		const report = makeReport(
			severities.map( ( severity, index ) => makeRun( `audits/check-${ index }`, severity, 'fail' ) )
		);

		// Act.
		const { state } = buildRunSummary( report );

		// Assert.
		expect( state ).toBe( expectedState );
	} );

	it( 'ignores unscored failed checks', () => {
		// Arrange.
		const report = makeReport( [ makeRun( 'audits/scan-for-cookies', 'info', 'fail', 0 ) ] );

		// Act.
		const summary = buildRunSummary( report );

		// Assert.
		expect( summary.state ).toBe( 'success' );
		expect( summary.metadata.fix_count ).toBe( 0 );
	} );
} );
