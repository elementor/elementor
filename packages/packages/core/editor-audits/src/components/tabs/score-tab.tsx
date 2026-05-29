import * as React from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import ScoreGauge from './score-gauge';

type Props = {
	report: PageAuditReport;
	onCategoryClick: ( category: AuditCategory ) => void;
};

const CATEGORY_LABELS: Record< AuditCategory, string > = {
	health: __( 'Health', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	'best-practices': __( 'Best Practices', 'elementor' ),
};

const TAB_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance' ];

const OVERALL_GAUGE_SIZE = 128;

export default function ScoreTab( { report, onCategoryClick }: Props ) {
	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 } }>
			<ScoreGauge score={ report.overall } label={ __( 'Overall', 'elementor' ) } size={ OVERALL_GAUGE_SIZE } />
			<Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' } }>
				{ TAB_CATEGORIES.filter( ( category ) => report.categories[ category ].total > 0 ).map(
					( category ) => (
						<ScoreGauge
							key={ category }
							score={ report.categories[ category ].score }
							label={ CATEGORY_LABELS[ category ] }
							onClick={ () => onCategoryClick( category ) }
						/>
					)
				) }
			</Box>
		</Box>
	);
}
