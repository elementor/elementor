import { type AuditCategory, type AuditResult, type AuditRun, type PageAuditReport } from '../types';
import { isScoredAudit } from './is-scored-audit';
import { sortFailedAuditResults } from './sort-failed-audits';

export type PartitionedAuditResults = {
	failed: Array< AuditRun & { result: Extract< AuditResult, { status: 'fail' } > } >;
	passed: Array< AuditRun & { result: Extract< AuditResult, { status: 'pass' } > } >;
	skipped: Array< AuditRun & { result: Extract< AuditResult, { status: 'skipped' } > } >;
	totalViolations: number;
};

type PartitionOptions = {
	category?: AuditCategory;
	sortFailed?: boolean;
};

export function partitionAuditResults(
	report: PageAuditReport,
	options: PartitionOptions = {}
): PartitionedAuditResults {
	const { category, sortFailed = true } = options;
	const failed: PartitionedAuditResults[ 'failed' ] = [];
	const passed: PartitionedAuditResults[ 'passed' ] = [];
	const skipped: PartitionedAuditResults[ 'skipped' ] = [];

	let totalViolations = 0;

	for ( const run of report.auditResults ) {
		if ( category && ! run.audit.categories.includes( category ) ) {
			continue;
		}

		switch ( run.result.status ) {
			case 'fail':
				failed.push( { ...run, result: run.result } );

				if ( isScoredAudit( run.audit ) ) {
					totalViolations += run.result.violations.length;
				}

				break;
			case 'pass':
				passed.push( { ...run, result: run.result } );
				break;
			case 'skipped':
				skipped.push( { ...run, result: run.result } );
				break;
		}
	}

	return {
		failed: sortFailed ? sortFailedAuditResults( failed ) : failed,
		passed,
		skipped,
		totalViolations,
	};
}

export function getPopulatedCategories(
	categoryTotals: PageAuditReport[ 'categories' ],
	categories: readonly AuditCategory[]
): AuditCategory[] {
	return categories.filter( ( category ) => categoryTotals[ category ].total > 0 );
}
