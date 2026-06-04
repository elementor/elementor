import { type AuditMeta, type AuditSeverity } from '../types';

const SEVERITY_SORTING_RANK: Record< AuditSeverity, number > = {
	error: 0,
	warning: 1,
	info: 2,
};

export function sortFailedAuditResults< T extends { audit: AuditMeta } >( results: T[] ): T[] {
	return [ ...results ].sort( ( a, b ) => {
		const rankDiff = SEVERITY_SORTING_RANK[ a.audit.severity ] - SEVERITY_SORTING_RANK[ b.audit.severity ];

		if ( rankDiff !== 0 ) {
			return rankDiff;
		}

		return a.audit.title.localeCompare( b.audit.title );
	} );
}
