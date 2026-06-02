import { type AuditCategory, type AuditDescriptor, type AuditResult, type PageAuditReport } from '../types';

const ALL_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance', 'compliance' ];

type Input = Array< { descriptor: AuditDescriptor; result: AuditResult } >;

export function computeReport( documentId: number, results: Input ): PageAuditReport {
	const categories = ALL_CATEGORIES.reduce(
		( acc, category ) => {
			acc[ category ] = { score: 0, failed: 0, total: 0 };
			return acc;
		},
		{} as PageAuditReport[ 'categories' ]
	);

	const counted = results.filter( ( r ) => r.result.status !== 'skipped' );

	for ( const category of ALL_CATEGORIES ) {
		const inCategory = counted.filter( ( r ) => r.descriptor.categories.includes( category ) );
		const totalWeight = inCategory.reduce( ( sum, r ) => sum + r.descriptor.weight, 0 );
		const passedWeight = inCategory
			.filter( ( r ) => r.result.status === 'pass' )
			.reduce( ( sum, r ) => sum + r.descriptor.weight, 0 );
		const failedCount = inCategory.filter( ( r ) => r.result.status === 'fail' ).length;

		categories[ category ].total = inCategory.length;
		categories[ category ].failed = failedCount;
		categories[ category ].score = totalWeight === 0 ? 0 : Math.round( ( passedWeight / totalWeight ) * 100 );
	}

	const populated = ALL_CATEGORIES.filter( ( c ) => categories[ c ].total > 0 );
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
