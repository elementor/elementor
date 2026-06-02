import * as React from 'react';
import { useState } from 'react';
import { Box, Divider, Tab, Tabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../types';
import CategoryPage from './pages/category-page';
import IssuesPage from './pages/issues-page';
import OverviewPage from './pages/overview-page';

type ActivePage = 'overview' | 'issues' | { category: AuditCategory };

type Props = {
	report: PageAuditReport;
};

function activeTab( page: ActivePage ): 'overview' | 'issues' {
	if ( page === 'overview' ) {
		return 'overview';
	}

	return 'issues';
}

export default function ReportShell( { report }: Props ) {
	const [ activePage, setActivePage ] = useState< ActivePage >( 'overview' );

	const currentTab = activeTab( activePage );

	const handleTabChange = ( _: React.SyntheticEvent, value: 'overview' | 'issues' ) => {
		setActivePage( value );
	};

	const openCategory = ( category: AuditCategory ) => {
		setActivePage( { category } );
	};

	const backToIssues = () => {
		setActivePage( 'issues' );
	};

	return (
		<Box>
			<Tabs
				aria-label={ __( 'Audit navigation', 'elementor' ) }
				value={ currentTab }
				onChange={ handleTabChange }
				textColor="secondary"
				indicatorColor="secondary"
				size="small"
				centered={ true }
				variant="fullWidth"
			>
				<Tab value="overview" label={ __( 'Overview', 'elementor' ) } />
				<Tab value="issues" label={ __( 'Issues', 'elementor' ) } />
			</Tabs>
			<Divider sx={ { borderColor: 'var(--e-a-border-color)' } } />
			{ activePage === 'overview' && <OverviewPage report={ report } onCategoryClick={ openCategory } /> }
			{ activePage === 'issues' && <IssuesPage report={ report } onCategoryClick={ openCategory } /> }
			{ typeof activePage === 'object' && (
				<CategoryPage category={ activePage.category } report={ report } onBack={ backToIssues } />
			) }
		</Box>
	);
}
