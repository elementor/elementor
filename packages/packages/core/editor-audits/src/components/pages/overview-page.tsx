import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { getPopulatedCategories } from '../../utils/audit-status-summary';
import { countSeverities } from '../../utils/severity-counts';
import IssuesCategoryRow from '../issues-category-row';
import Promotions from '../promotions';
import SeveritySummaryCards from '../severity-summary-cards';

type Props = {
	onCategoryClick: ( category: AuditCategory ) => void;
	report: PageAuditReport;
};

export default function OverviewPage( { onCategoryClick, report }: Props ) {
	const populatedCategories = getPopulatedCategories( report.categories, ALL_CATEGORIES );

	const categoryRows = populatedCategories
		.map( ( category ) => ( { category, counts: countSeverities( report, category ) } ) )
		.filter( ( { counts } ) => Object.values( counts ).some( ( count ) => count > 0 ) );

	return (
		<Box display="flex" flexDirection="column" gap={ 3 } p={ 2 }>
			<SeveritySummaryCards report={ report } />
			<Box display="flex" flexDirection="column" gap={ 1 }>
				<Typography variant="subtitle1" component="h2">
					{ __( 'All issues', 'elementor' ) }
				</Typography>
				<Box display="flex" flexDirection="column" gap={ 1 }>
					{ categoryRows.map( ( { category, counts } ) => (
						<IssuesCategoryRow
							key={ category }
							category={ category }
							label={ CATEGORY_LABELS[ category ] }
							counts={ counts }
							onClick={ () => onCategoryClick( category ) }
						/>
					) ) }
				</Box>
			</Box>
			<Promotions report={ report } />
		</Box>
	);
}
