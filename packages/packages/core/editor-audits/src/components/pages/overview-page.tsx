import * as React from 'react';
import { Box, Chip, type ChipProps, Typography } from '@elementor/ui';
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

function overallStatusColor( score: number ): ChipProps[ 'color' ] {
	if ( score >= GOOD_THRESHOLD ) {
		return 'success';
	}

	if ( score >= OK_THRESHOLD ) {
		return 'warning';
	}

	return 'error';
}

export default function OverviewPage( { report, onCategoryClick }: Props ) {
	const populatedCategories = ALL_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, p: 2 } }>
			<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 } }>
				<Typography
					variant="h2"
					component="span"
					color="text.primary"
					sx={ { lineHeight: 1, fontWeight: 700 } }
				>
					{ report.overall }
				</Typography>
				<Chip
					label={ overallStatusLabel( report.overall ) }
					color={ overallStatusColor( report.overall ) }
					variant="standard"
					size="small"
					sx={ { fontWeight: 600 } }
				/>
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
		</Box>
	);
}
