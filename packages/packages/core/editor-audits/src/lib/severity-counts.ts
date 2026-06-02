import { type AuditCategory, type AuditSeverity, type PageAuditReport } from '../types';

export type SeverityCounts = Record< AuditSeverity, number >;

export function countSeveritiesForCategory( report: PageAuditReport, category: AuditCategory ): SeverityCounts {
	const counts: SeverityCounts = { error: 0, warning: 0, info: 0 };

	for ( const { descriptor, result } of report.auditResults ) {
		if ( result.status !== 'fail' ) {
			continue;
		}

		if ( ! descriptor.categories.includes( category ) ) {
			continue;
		}

		counts[ descriptor.severity ] += result.violations.length;
	}

	return counts;
}
