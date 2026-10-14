import { ALL_CATEGORIES } from '../constants';
import { type AuditRun, type PageAuditReport } from '../types';
import { getPopulatedCategories } from './audit-status-summary';

type CategoryAccumulator = { totalWeight: number; passedWeight: number; total: number; failed: number };

export function computeReport( documentId: number, results: AuditRun[] ): PageAuditReport {
	const accumulators = Object.fromEntries(
		ALL_CATEGORIES.map( ( c ) => [ c, { totalWeight: 0, passedWeight: 0, total: 0, failed: 0 } ] )
	) as Record< string, CategoryAccumulator >;

	for ( const { audit, result } of results ) {
		if ( result.status === 'skipped' ) {
			continue;
		}

		for ( const category of audit.categories ) {
			const acc = accumulators[ category ];
			acc.total++;
			acc.totalWeight += audit.weight;

			if ( result.status === 'pass' ) {
				acc.passedWeight += audit.weight;
			} else {
				acc.failed++;
			}
		}
	}

	const categories = Object.fromEntries(
		ALL_CATEGORIES.map( ( c ) => {
			const acc = accumulators[ c ];
			const score = acc.totalWeight === 0 ? 0 : Math.round( ( acc.passedWeight / acc.totalWeight ) * 100 );
			return [ c, { score, failed: acc.failed, total: acc.total } ];
		} )
	) as PageAuditReport[ 'categories' ];

	const populated = getPopulatedCategories( categories, ALL_CATEGORIES );
	const overall =
		populated.length === 0
			? 0
			: Math.round( populated.reduce( ( sum, c ) => sum + categories[ c ].score, 0 ) / populated.length );

	return {
		documentId,
		runAt: Date.now(),
		overall,
		categories,
		auditResults: results,
	};
}
