import * as React from 'react';
import { useState } from 'react';
import { Box } from '@elementor/ui';

import { type AuditCategory, type PageAuditReport } from '../types';
import CategoryPage from './pages/category-page';
import OverviewPage from './pages/overview-page';

type ActivePage = 'overview' | { category: AuditCategory };

type Props = {
	report: PageAuditReport;
};

function isCategoryPage( page: ActivePage ): page is { category: AuditCategory } {
	return typeof page === 'object' && 'category' in page;
}

export default function ReportShell( { report }: Props ) {
	const [ activePage, setActivePage ] = useState< ActivePage >( 'overview' );

	const openCategory = ( category: AuditCategory ) => setActivePage( { category } );
	const backToOverview = () => setActivePage( 'overview' );

	return (
		<Box sx={ { flex: 1, minHeight: 0, overflowY: 'auto' } }>
			{ activePage === 'overview' && <OverviewPage report={ report } onCategoryClick={ openCategory } /> }
			{ isCategoryPage( activePage ) && (
				<CategoryPage category={ activePage.category } report={ report } onBack={ backToOverview } />
			) }
		</Box>
	);
}
