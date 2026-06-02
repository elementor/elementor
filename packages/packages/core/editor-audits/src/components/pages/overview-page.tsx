import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import ScoreBar from '../score-bar';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
};

const GOOD_THRESHOLD = 90;
const OK_THRESHOLD = 50;

function overallStatusLabel( score: number ): string {
	if ( score >= GOOD_THRESHOLD ) {
		return __( 'Good', 'elementor' );
	}

	if ( score >= OK_THRESHOLD ) {
		return __( 'Needs work', 'elementor' );
	}

	return __( 'At risk', 'elementor' );
}

function overallStatusColor( score: number ): string {
	if ( score >= GOOD_THRESHOLD ) {
		return 'success.main';
	}

	if ( score >= OK_THRESHOLD ) {
		return 'warning.main';
	}

	return 'error.main';
}

export default function OverviewPage( { report, onCategoryClick }: Props ) {
	const populatedCategories = ALL_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 3, p: 2 } }>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
				<Typography variant="h2" component="span" sx={ { lineHeight: 1, fontWeight: 700 } }>
					{ report.overall }
				</Typography>
				<Box>
					<Typography variant="body2" sx={ { color: overallStatusColor( report.overall ), fontWeight: 600 } }>
						{ overallStatusLabel( report.overall ) }
					</Typography>
				</Box>
			</Box>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
				{ populatedCategories.map( ( category ) => (
					<ScoreBar
						key={ category }
						label={ CATEGORY_LABELS[ category ] }
						score={ report.categories[ category ].score }
						onClick={ () => onCategoryClick( category ) }
					/>
				) ) }
			</Box>
		</Box>
	);
}
