import * as React from 'react';
import { useState } from 'react';
import { Box, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { type AuditStatusGroup, getPopulatedCategories } from '../../utils/audit-status-summary';
import { countSeverities, type SeverityCounts } from '../../utils/severity-counts';
import AuditStatusesSection from '../audit-statuses-section';
import IssuesCategoryRow from '../issues-category-row';
import SeverityFilterChips, { type SeverityFilter } from '../severity-filter-chips';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
	onAllAuditsClick: () => void;
	onStatusClick: ( status: AuditStatusGroup ) => void;
};

function filterCounts( counts: SeverityCounts, filter: SeverityFilter ): SeverityCounts {
	if ( filter === 'all' ) {
		return counts;
	}

	return { error: 0, warning: 0, info: 0, [ filter ]: counts[ filter ] };
}

export default function IssuesPage( { report, onCategoryClick, onAllAuditsClick, onStatusClick }: Props ) {
	const [ filter, setFilter ] = useState< SeverityFilter >( 'all' );
	const populatedCategories = getPopulatedCategories( report.categories, ALL_CATEGORIES );

	const categoryRows = populatedCategories
		.map( ( category ) => ( { category, counts: filterCounts( countSeverities( report, category ), filter ) } ) )
		.filter( ( { counts } ) => Object.values( counts ).some( ( count ) => count > 0 ) );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, p: 2 } }>
			<AuditStatusesSection report={ report } onStatusClick={ onStatusClick } />
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
			<SeverityFilterChips selected={ filter } onChange={ setFilter } />
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
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
	);
}
