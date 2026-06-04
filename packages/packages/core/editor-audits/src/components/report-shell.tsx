import * as React from 'react';
import { useState } from 'react';
import { Box, Divider, Tab, Tabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditStatusGroup } from '../lib/audit-status-summary';
import { type AuditCategory, type PageAuditReport } from '../types';
import AllAuditsPage from './pages/all-audits-page';
import CategoryPage from './pages/category-page';
import IssuesPage from './pages/issues-page';
import OverviewPage from './pages/overview-page';

type TabId = 'overview' | 'issues';

type ActivePage =
	| 'overview'
	| 'issues'
	| { backTo: TabId; category: AuditCategory }
	| { backTo: TabId; expand?: AuditStatusGroup; page: 'all-audits' };

type Props = {
	report: PageAuditReport;
};

function activeTab( page: ActivePage ): TabId {
	if ( page === 'overview' ) {
		return 'overview';
	}

	if ( page === 'issues' ) {
		return 'issues';
	}

	return page.backTo;
}

function isAllAuditsPage( page: ActivePage ): page is { backTo: TabId; expand?: AuditStatusGroup; page: 'all-audits' } {
	return typeof page === 'object' && 'page' in page && page.page === 'all-audits';
}

function isCategoryPage( page: ActivePage ): page is { backTo: TabId; category: AuditCategory } {
	return typeof page === 'object' && 'category' in page;
}

export default function ReportShell( { report }: Props ) {
	const [ activePage, setActivePage ] = useState< ActivePage >( 'overview' );

	const currentTab = activeTab( activePage );

	const handleTabChange = ( _: React.SyntheticEvent, value: TabId ) => {
		setActivePage( value );
	};

	const openCategory = ( category: AuditCategory, backTo: TabId ) => {
		setActivePage( { category, backTo } );
	};

	const openAllAudits = ( expand?: AuditStatusGroup, backTo: TabId = 'issues' ) => {
		setActivePage( { page: 'all-audits', expand, backTo } );
	};

	const backFromSubPage = () => {
		if ( isAllAuditsPage( activePage ) || isCategoryPage( activePage ) ) {
			setActivePage( activePage.backTo );
		}
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
			<Divider />
			{ activePage === 'overview' && (
				<OverviewPage
					report={ report }
					onCategoryClick={ ( category ) => openCategory( category, 'overview' ) }
					onStatusClick={ ( status ) => openAllAudits( status, 'overview' ) }
				/>
			) }
			{ activePage === 'issues' && (
				<IssuesPage
					report={ report }
					onCategoryClick={ ( category ) => openCategory( category, 'issues' ) }
					onAllAuditsClick={ () => openAllAudits() }
				/>
			) }
			{ isAllAuditsPage( activePage ) && (
				<AllAuditsPage
					report={ report }
					initialExpandedStatus={ activePage.expand }
					onBack={ backFromSubPage }
				/>
			) }
			{ isCategoryPage( activePage ) && (
				<CategoryPage category={ activePage.category } report={ report } onBack={ backFromSubPage } />
			) }
		</Box>
	);
}
