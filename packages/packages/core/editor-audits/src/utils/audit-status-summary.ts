import { type ChipProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditRun, type PageAuditReport } from '../types';
import { sortFailedAuditResults } from './sort-failed-audits';

export type AuditStatusGroup = 'fail' | 'pass' | 'skipped';

export type PartitionedAuditResults = {
	failed: AuditRun[];
	passed: AuditRun[];
	skipped: AuditRun[];
	totalViolations: number;
};

export function partitionAuditResults( report: PageAuditReport ): PartitionedAuditResults {
	const failed = sortFailedAuditResults( report.auditResults.filter( ( r ) => r.result.status === 'fail' ) );
	const passed = report.auditResults.filter( ( r ) => r.result.status === 'pass' );
	const skipped = report.auditResults.filter( ( r ) => r.result.status === 'skipped' );
	const totalViolations = failed.reduce(
		( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ),
		0
	);

	return { failed, passed, skipped, totalViolations };
}

export function auditStatusDisplayCounts( report: PageAuditReport ): Record< AuditStatusGroup, number > {
	const { passed, skipped, totalViolations } = partitionAuditResults( report );

	return {
		fail: totalViolations,
		pass: passed.length,
		skipped: skipped.length,
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
