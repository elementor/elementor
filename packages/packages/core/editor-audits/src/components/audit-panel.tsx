import * as React from 'react';
import { FloatingPanelBody, FloatingPanelFooter, FloatingPanelHeader } from '@elementor/editor-floating-panels';
import { AIIcon } from '@elementor/icons';
import { Box, Button, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useAuditReport } from '../hooks/use-audit-report';
import ErrorPage from './pages/error-page';
import LoadingPage from './pages/loading-page';
import WelcomePage from './pages/welcome-page';
import ReportShell from './report-shell';

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

	const currentDocumentId = window.elementor?.documents?.getCurrent?.()?.id ?? 0;
	const onRun = () => run( currentDocumentId );
	const lastScanLabel = report ? new Date( report.runAt ).toLocaleTimeString() : null;

	return (
		<>
			<FloatingPanelHeader
				panelId="audit-panel"
				title={ __( 'Audit', 'elementor' ) }
				actions={ [
					{
						id: 'ai',
						icon: AIIcon,
						label: __( 'Coming soon', 'elementor' ),
						disabled: true,
					},
				] }
			/>
			<FloatingPanelBody>
				{ status === 'idle' && <WelcomePage /> }
				{ status === 'loading' && <LoadingPage /> }
				{ status === 'error' && <ErrorPage message={ error ?? '' } onRetry={ onRun } /> }
				{ status === 'ready' && report && <ReportShell report={ report } /> }
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
