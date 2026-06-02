import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { countSeveritiesForCategory } from '../../lib/severity-counts';
import { type AuditCategory, type PageAuditReport } from '../../types';
import IssuesCategoryRow from '../issues-category-row';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
};

const CATEGORY_LABELS: Record< AuditCategory, string > = {
	health: __( 'Health', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	compliance: __( 'Compliance', 'elementor' ),
};

const ALL_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance', 'compliance' ];

export default function IssuesPage( { report, onCategoryClick }: Props ) {
	const populatedCategories = ALL_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 } }>
			<Typography variant="subtitle1" component="h2">
				{ __( 'All issues', 'elementor' ) }
			</Typography>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
				{ populatedCategories.map( ( category ) => {
					const counts = countSeveritiesForCategory( report, category );

					return (
						<IssuesCategoryRow
							key={ category }
							category={ category }
							label={ CATEGORY_LABELS[ category ] }
							errorCount={ counts.error }
							warningCount={ counts.warning }
							infoCount={ counts.info }
							onClick={ () => onCategoryClick( category ) }
						/>
					);
				} ) }
			</Box>
		</Box>
	);
}
