import { type PageAuditReport } from '../types';
import { isScoredAudit } from './is-scored-audit';
import { toCheckName, toTrackingSeverity, type TrackingSeverity } from './tracking-names';

type RequiredFix = {
	check: string;
	severity: TrackingSeverity;
};

export type RunSummary = {
	state: TrackingSeverity | 'success';
	metadata: {
		score: number;
		fix_count: number;
		error_count: number;
		warning_count: number;
		suggestion_count: number;
		required_fixes: RequiredFix[];
	};
};

const SEVERITY_PRIORITY: TrackingSeverity[] = [ 'error', 'warning', 'suggestion' ];

export function buildRunSummary( report: PageAuditReport ): RunSummary {
	const requiredFixes: RequiredFix[] = report.auditResults
		.filter( ( { audit, result } ) => result.status === 'fail' && isScoredAudit( audit ) )
		.map( ( { audit } ) => ( { check: toCheckName( audit.id ), severity: toTrackingSeverity( audit.severity ) } ) );

	const countBySeverity = ( severity: TrackingSeverity ) =>
		requiredFixes.filter( ( fix ) => fix.severity === severity ).length;

	const highestSeverity = SEVERITY_PRIORITY.find( ( severity ) => countBySeverity( severity ) > 0 );

	return {
		state: highestSeverity ?? 'success',
		metadata: {
			score: report.overall,
			fix_count: requiredFixes.length,
			error_count: countBySeverity( 'error' ),
			warning_count: countBySeverity( 'warning' ),
			suggestion_count: countBySeverity( 'suggestion' ),
			required_fixes: requiredFixes,
		},
	};
}
