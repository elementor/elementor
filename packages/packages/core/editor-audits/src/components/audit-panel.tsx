import * as React from 'react';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { FloatingPanelBody, FloatingPanelFooter, FloatingPanelHeader } from '@elementor/editor-floating-panels';
import { AngieIcon } from '@elementor/icons';
import { Box, Button, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useAuditReport } from '../hooks/use-audit-report';
import ErrorPage from './pages/error-page';
import LoadingPage from './pages/loading-page';
import WelcomePage from './pages/welcome-page';
import ReportShell from './report-shell';

export default function AuditPanel() {
	const { status, report, error, run } = useAuditReport();

	const currentDocumentId = getCurrentDocumentId() ?? 0;
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
						icon: AngieIcon,
						label: __( 'Fix with AI', 'elementor' ),
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
			<FloatingPanelFooter>
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
