import { type ChipProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type AuditResult, type AuditRun, type PageAuditReport } from '../types';
import { sortFailedAuditResults } from './sort-failed-audits';

export type AuditStatusGroup = 'fail' | 'pass' | 'skipped';

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
				totalViolations += run.result.violations.length;
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

export function auditStatusDisplayCounts( report: PageAuditReport ): Record< AuditStatusGroup, number > {
	let pass = 0;
	let skipped = 0;
	let totalViolations = 0;

	for ( const { result } of report.auditResults ) {
		switch ( result.status ) {
			case 'fail':
				totalViolations += result.violations.length;
				break;
			case 'pass':
				pass++;
				break;
			case 'skipped':
				skipped++;
				break;
		}
	}

	return {
		fail: totalViolations,
		pass,
		skipped,
	};
}

export function auditStatusColor( status: AuditStatusGroup ): ChipProps[ 'color' ] {
	switch ( status ) {
		case 'fail':
			return 'error';
		case 'pass':
			return 'success';
		case 'skipped':
			return 'default';
	}
}

export function auditStatusLabel( status: AuditStatusGroup ): string {
	switch ( status ) {
		case 'fail':
			return __( 'Failed audits', 'elementor' );
		case 'pass':
			return __( 'Passed audits', 'elementor' );
		case 'skipped':
			return __( 'Skipped audits', 'elementor' );
	}
}

export function getPopulatedCategories(
	categoryTotals: PageAuditReport[ 'categories' ],
	categories: readonly AuditCategory[]
): AuditCategory[] {
	return categories.filter( ( category ) => categoryTotals[ category ].total > 0 );
}
