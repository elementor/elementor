import * as React from 'react';
import { getHostDocumentId } from '@elementor/editor-elements';
import { FloatingPanelBody, FloatingPanelFooter, FloatingPanelHeader } from '@elementor/editor-floating-panels';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { AUDIT_PANEL_ID } from '../constants';
import { useAuditReport } from '../hooks/use-audit-report';
import AuditFeedback from './audit-feedback';
import ErrorPage from './pages/error-page';
import LoadingPage from './pages/loading-page';
import WelcomePage from './pages/welcome-page';
import ReportShell from './report-shell';
import RescanButton from './rescan-button';

export default function AuditPanel() {
	const { status, report, error, isStale, run } = useAuditReport();

	const hostDocumentId = getHostDocumentId() ?? 0;
	const onRun = () => run( hostDocumentId );
	const lastScanLabel = report ? new Date( report.runAt ).toLocaleTimeString() : null;

	return (
		<>
			<FloatingPanelHeader
				panelId={ AUDIT_PANEL_ID }
				title={ __( 'Page Audit', 'elementor' ) }
				badge={ __( 'Beta', 'elementor' ) }
				titleVariant="subtitle2"
			/>
			<FloatingPanelBody
				sx={
					status === 'ready'
						? { display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }
						: undefined
				}
			>
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
				{ lastScanLabel && <AuditFeedback /> }
				<RescanButton
					hasScanned={ Boolean( lastScanLabel ) }
					isStale={ isStale }
					disabled={ status === 'loading' || hostDocumentId === 0 }
					onClick={ onRun }
				/>
			</FloatingPanelFooter>
		</>
	);
}
