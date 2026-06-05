import * as React from 'react';
import { Box, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { countSeverities } from '../../lib/severity-counts';
import { type AuditCategory, type PageAuditReport } from '../../types';
import IssuesCategoryRow from '../issues-category-row';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
	onAllAuditsClick: () => void;
};

export default function IssuesPage( { report, onCategoryClick, onAllAuditsClick }: Props ) {
	const populatedCategories = ALL_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 } }>
			<Link
				component="button"
				underline="none"
				color="inherit"
				onClick={ onAllAuditsClick }
				sx={ { textAlign: 'start' } }
			>
				<Typography variant="subtitle1" component="h2">
					{ __( 'All issues', 'elementor' ) }
				</Typography>
			</Link>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
				{ populatedCategories.map( ( category ) => (
					<IssuesCategoryRow
						key={ category }
						category={ category }
						label={ CATEGORY_LABELS[ category ] }
						counts={ countSeverities( report, category ) }
						onClick={ () => onCategoryClick( category ) }
					/>
				) ) }
			</Box>
		</Box>
	);
}
