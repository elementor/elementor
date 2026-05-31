import * as React from 'react';
import { useState } from 'react';
import { FloatingPanelBody, FloatingPanelFooter, FloatingPanelHeader } from '@elementor/editor-floating-panels';
import { Box, Button, Tab, Tabs, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useAuditReport } from '../hooks/use-audit-report';
import { type AuditCategory } from '../types';
import EmptyState from './states/empty-state';
import ErrorState from './states/error-state';
import LoadingState from './states/loading-state';
import CategoryTab from './tabs/category-tab';
import ScoreTab from './tabs/score-tab';

const TAB_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance' ];

const TAB_LABELS: Record< AuditCategory, string > = {
	health: __( 'Health', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	'best-practices': __( 'Best Practices', 'elementor' ),
};

declare global {
	interface Window {
		elementor?: {
			documents?: {
				getCurrent?: () => { id: number } | undefined;
			};
		};
	}
}

export default function AuditPanel() {
	const { status, report, error, run } = useAuditReport();
	const [ activeTab, setActiveTab ] = useState< 'score' | AuditCategory >( 'score' );

	const currentDocumentId = window.elementor?.documents?.getCurrent?.()?.id ?? 0;
	const onRun = () => run( currentDocumentId );
	const lastScanLabel = report ? new Date( report.runAt ).toLocaleTimeString() : null;

	return (
		<>
			<FloatingPanelHeader panelId="audit-panel" title={ __( 'Audit', 'elementor' ) } />
			<FloatingPanelBody>
				{ status === 'idle' && <EmptyState /> }
				{ status === 'loading' && <LoadingState /> }
				{ status === 'error' && <ErrorState message={ error ?? '' } onRetry={ onRun } /> }
				{ status === 'ready' && report && (
					<Box>
						<Tabs
							value={ activeTab }
							onChange={ ( _, value ) => setActiveTab( value as 'score' | AuditCategory ) }
							variant="scrollable"
							scrollButtons="auto"
						>
							<Tab value="score" label={ __( 'Score', 'elementor' ) } />
							{ TAB_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 ).map( ( c ) => (
								<Tab key={ c } value={ c } label={ TAB_LABELS[ c ] } />
							) ) }
						</Tabs>
						{ activeTab === 'score' ? (
							<ScoreTab report={ report } onCategoryClick={ ( c ) => setActiveTab( c ) } />
						) : (
							<CategoryTab category={ activeTab } report={ report } />
						) }
					</Box>
				) }
			</FloatingPanelBody>
			<FloatingPanelFooter panelId="audit-panel">
				{ lastScanLabel ? (
					<Typography variant="caption" sx={ { flex: 1 } }>
						{ __( 'Last scan:', 'elementor' ) } { lastScanLabel }
					</Typography>
				) : (
					<Box sx={ { flex: 1 } } />
				) }
				<Button
					variant="contained"
					size="small"
					onClick={ onRun }
					disabled={ status === 'loading' || currentDocumentId === 0 }
				>
					{ lastScanLabel ? __( 'Re-scan', 'elementor' ) : __( 'Run page audit', 'elementor' ) }
				</Button>
			</FloatingPanelFooter>
		</>
	);
}
