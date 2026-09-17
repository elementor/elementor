import * as React from 'react';
import { Box, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { getPopulatedCategories } from '../../utils/audit-status-summary';
import { countSeverities } from '../../utils/severity-counts';
import IssuesCategoryRow from '../issues-category-row';
import Promotions from '../promotions';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
	onAllAuditsClick: () => void;
};

export default function IssuesPage( { report, onCategoryClick, onAllAuditsClick }: Props ) {
	const populatedCategories = getPopulatedCategories( report.categories, ALL_CATEGORIES );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, p: 2 } }>
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
			<Promotions report={ report } />
		</Box>
	);
}
