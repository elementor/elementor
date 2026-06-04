import { type AuditDescriptor, type AuditSeverity } from '../types';

const SEVERITY_SORTING_RANK: Record< AuditSeverity, number > = {
	error: 0,
	warning: 1,
	info: 2,
};

export function sortFailedAuditResults< T extends { descriptor: AuditDescriptor } >( results: T[] ): T[] {
	return [ ...results ].sort( ( a, b ) => {
		const rankDiff = SEVERITY_SORTING_RANK[ a.descriptor.severity ] - SEVERITY_SORTING_RANK[ b.descriptor.severity ];

		if ( rankDiff !== 0 ) {
			return rankDiff;
		}

		return a.descriptor.title.localeCompare( b.descriptor.title );
	} );
}
