import * as React from 'react';
import { useState } from 'react';
import { Box, Divider, Tab, Tabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import { CATEGORY_ICONS } from '../category-icons';
import CategoryTab from './category-tab';
import ScoreTab from './score-tab';

type Props = {
	report: PageAuditReport;
};

const TAB_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance', 'compliance' ];

const TAB_LABELS: Record< AuditCategory, string > = {
	health: __( 'Health', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	compliance: __( 'Compliance', 'elementor' ),
};

export default function AuditTabs( { report }: Props ) {
	const [ activeTab, setActiveTab ] = useState< 'score' | AuditCategory >( 'score' );

	const availableCategories = TAB_CATEGORIES.filter( ( category ) => report.categories[ category ].total > 0 );

	return (
		<Box>
			<Tabs
				aria-label={ __( 'Audit tabs', 'elementor' ) }
				value={ activeTab }
				onChange={ ( _, value ) => setActiveTab( value as 'score' | AuditCategory ) }
				variant="scrollable"
				scrollButtons="auto"
				textColor="secondary"
				size="small"
			>
				<Tab value="score" label={ __( 'Score', 'elementor' ) } />
				{ availableCategories.map( ( category ) => {
					const Icon = CATEGORY_ICONS[ category ];
					return (
						<Tab
							key={ category }
							value={ category }
							label={ TAB_LABELS[ category ] }
							icon={ <Icon fontSize="small" /> }
							iconPosition="start"
						/>
					);
				} ) }
			</Tabs>
			<Divider sx={ { mb: 1, borderColor: 'var(--e-a-border-color)' } } />
			{ activeTab === 'score' ? (
				<ScoreTab report={ report } onCategoryClick={ ( category ) => setActiveTab( category ) } />
			) : (
				<CategoryTab category={ activeTab } report={ report } />
			) }
		</Box>
	);
}
