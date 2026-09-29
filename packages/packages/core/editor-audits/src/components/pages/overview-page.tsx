import * as React from 'react';
import { Box, Chip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { getPopulatedCategories } from '../../utils/audit-status-summary';
import { getScoreTier } from '../../utils/score-thresholds';
import Promotions from '../promotions';
import ScoreBar from '../score-bar';
import ScoreCircle from '../score-circle';

type Props = {
	onCategoryClick: ( category: AuditCategory ) => void;
	report: PageAuditReport;
};

export default function OverviewPage( { onCategoryClick, report }: Props ) {
	const populatedCategories = getPopulatedCategories( report.categories, ALL_CATEGORIES );
	const overallScore = getScoreTier( report.overall );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, p: 2 } }>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
				<ScoreCircle color={ overallScore.color } score={ report.overall } />
				<Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
					<Chip
						label={ overallScore.label }
						color={ overallScore.color }
						variant="standard"
						size="small"
						sx={ { fontWeight: 600, alignSelf: 'flex-start' } }
					/>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Overall score', 'elementor' ) }
					</Typography>
				</Box>
			</Box>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
				{ populatedCategories.map( ( category ) => (
					<ScoreBar
						key={ category }
						label={ CATEGORY_LABELS[ category ] }
						score={ report.categories[ category ].score }
						onClick={ () => onCategoryClick( category ) }
					/>
				) ) }
			</Box>
			<Promotions report={ report } />
		</Box>
	);
}
