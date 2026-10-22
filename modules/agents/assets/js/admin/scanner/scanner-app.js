import { useMemo } from 'react';
import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import Alert from '@elementor/ui/Alert';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { ActivateBanner } from './components/activate-banner';
import { ErrorReportCard } from './components/error-report-card';
import { FirstRunView } from './components/first-run-view';
import { FixesSection } from './components/fixes-section';
import { PassingTable } from './components/passing-table';
import { ProgressView } from './components/progress-view';
import { RescanSkeletonView } from './components/rescan-skeleton-view';
import { ScoreRow, ScoreSummaryBlock } from './components/score-summary-block';
import { StageBars } from './components/stage-bars';
import {
	SCANNER_COLORS,
	SCANNER_LAYOUT,
	SCANNER_STATE_ACTIVATING,
	SCANNER_STATE_ERROR_PROGRESS,
	SCANNER_STATE_ERROR_REPORT,
	SCANNER_STATE_FIRST_CHECK,
	SCANNER_STATE_FIRST_RUN,
	SCANNER_STATE_FIXES,
	SCANNER_STATE_PROGRESS,
	SCANNER_STATE_RESCANNING,
} from './scanner-constants';
import { resolveAgentReadyActive } from './resolve-agent-ready-active';
import { getLaterRetryAt, toScanResult } from './scanner-report-adapter';
import { useScannerFlow } from './use-scanner-flow';

const ScannerShell = ( { children, hideOverline, fillViewport } ) => (
	<Box
		bgcolor={ fillViewport ? SCANNER_COLORS.paper : SCANNER_COLORS.page }
		boxSizing="border-box"
		sx={ fillViewport ? {
			display: 'flex',
			flexDirection: 'column',
			width: `calc(100% + ${ SCANNER_LAYOUT.wrapInlinePadding * 2 }px)`,
			marginInline: `-${ SCANNER_LAYOUT.wrapInlinePadding }px`,
			marginTop: `-${ SCANNER_LAYOUT.wrapBlockStart }px`,
			minHeight: SCANNER_LAYOUT.progressPaneMinHeight,
		} : {
			width: '100%',
			py: 3,
		} }
	>
		<Stack gap={ hideOverline ? 0 : `${ SCANNER_LAYOUT.pageGap }px` } width="100%" flex={ fillViewport ? 1 : undefined } minHeight={ fillViewport ? '100%' : undefined }>
			{ ! hideOverline && (
				<Typography variant="overline" component="h2" color="text.tertiary" m={ 0 }>
					{ __( 'Agent Ready', 'elementor' ) }
				</Typography>
			) }
			{ children }
		</Stack>
	</Box>
);

ScannerShell.propTypes = {
	children: PropTypes.node.isRequired,
	hideOverline: PropTypes.bool,
	fillViewport: PropTypes.bool,
};

const ScannerView = ( { flow, siteDomain, agentAccessUrl } ) => {
	const { view, scan } = flow;
	const isActivating = SCANNER_STATE_ACTIVATING === view;

	const renderActivateBanner = () => (
		<ActivateBanner
			isActivating={ isActivating }
			onActivate={ flow.activate }
			agentAccessUrl={ agentAccessUrl }
			error={ flow.actionError }
		/>
	);

	const renderScoreRow = () => (
		<ScoreRow
			score={ flow.ringScore }
			ringDurationMs={ flow.ringDurationMs }
			isDimmed={ isActivating }
			isActivated={ flow.isActivated }
			isBusy={ isActivating }
			needsRescanForScore={ flow.needsRescanForScore }
			siteDomain={ siteDomain }
			ranAt={ scan?.ranAt }
			agentAccessUrl={ agentAccessUrl }
			retryAt={ scan?.retryAt }
			onRescan={ flow.startScan }
		/>
	);

	const renderReport = ( { withBanner } ) => (
		<>
			<ScoreSummaryBlock banner={ withBanner ? renderActivateBanner() : null }>{ renderScoreRow() }</ScoreSummaryBlock>
			{ ( scan?.stages ?? [] ).length > 0 && <StageBars stages={ scan.stages } /> }
			{ ! withBanner && flow.actionError && <Alert severity="error">{ flow.actionError }</Alert> }
			<FixesSection
				checks={ flow.visibleChecks }
				flow={ flow }
				agentAccessUrl={ agentAccessUrl }
				isActivated={ flow.isActivated }
				score={ flow.ringScore }
				isLoading={ isActivating }
			/>
			<PassingTable checks={ scan?.passingChecks ?? [] } />
		</>
	);

	if ( SCANNER_STATE_FIRST_RUN === view ) {
		return (
			<FirstRunView
				agentAccessUrl={ agentAccessUrl }
				siteDomain={ siteDomain }
				onStart={ flow.startScan }
				retryAt={ flow.retryAt }
			/>
		);
	}

	if ( SCANNER_STATE_PROGRESS === view || SCANNER_STATE_ERROR_PROGRESS === view ) {
		return (
			<ProgressView
				siteDomain={ siteDomain }
				steps={ flow.progressSteps }
				completedStepsCount={ flow.completedStepsCount }
				isFailed={ SCANNER_STATE_ERROR_PROGRESS === view }
			/>
		);
	}

	if ( SCANNER_STATE_RESCANNING === view ) {
		return (
			<RescanSkeletonView
				score={ flow.ringScore }
				ringDurationMs={ flow.ringDurationMs }
				showBanner={ ! flow.isActivated }
				agentAccessUrl={ agentAccessUrl }
			/>
		);
	}

	if ( SCANNER_STATE_ERROR_REPORT === view ) {
		return (
			<ScoreSummaryBlock banner={ flow.isActivated ? null : renderActivateBanner() }>
				<ErrorReportCard
					siteDomain={ siteDomain }
					reason={ scan?.outsideScan?.reason }
					retryAt={ scan?.retryAt }
					onRescan={ flow.startScan }
					isActivated={ flow.isActivated }
				/>
			</ScoreSummaryBlock>
		);
	}

	if ( SCANNER_STATE_FIXES === view ) {
		return renderReport( { withBanner: false } );
	}

	if ( SCANNER_STATE_FIRST_CHECK === view || isActivating ) {
		return renderReport( { withBanner: ! flow.isActivated } );
	}

	return null;
};

ScannerView.propTypes = {
	flow: PropTypes.object.isRequired,
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
};

const ScannerScreen = ( { siteDomain, agentAccessUrl, lastReport, retryAt = null, isExperimentActive } ) => {
	const agentReadyActive = useMemo( () => resolveAgentReadyActive( isExperimentActive ), [ isExperimentActive ] );
	const initialScan = useMemo(
		() => ( lastReport ? toScanResult( lastReport, getLaterRetryAt( lastReport.retryAt, retryAt ) ) : null ),
		[ lastReport, retryAt ],
	);
	const flow = useScannerFlow( {
		initialScan,
		initialRetryAt: lastReport ? null : retryAt,
		isExperimentActive: agentReadyActive,
	} );
	const isFirstRun = SCANNER_STATE_FIRST_RUN === flow.view;
	const isScanProgress = SCANNER_STATE_PROGRESS === flow.view || SCANNER_STATE_ERROR_PROGRESS === flow.view;

	return (
		<ScannerShell hideOverline={ isFirstRun || isScanProgress } fillViewport={ isScanProgress }>
			<ScannerView flow={ flow } siteDomain={ siteDomain } agentAccessUrl={ agentAccessUrl } />
		</ScannerShell>
	);
};

ScannerScreen.propTypes = {
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	lastReport: PropTypes.object,
	retryAt: PropTypes.string,
	isExperimentActive: PropTypes.bool,
};

export const ScannerApp = ( { isRTL, siteDomain, agentAccessUrl, lastReport, retryAt = null, isExperimentActive = false } ) => (
	<DirectionProvider rtl={ isRTL }>
		<LocalizationProvider>
			<ThemeProvider colorScheme="light" palette="argon-beta">
				<ScannerScreen
					siteDomain={ siteDomain }
					agentAccessUrl={ agentAccessUrl }
					lastReport={ lastReport }
					retryAt={ retryAt }
					isExperimentActive={ isExperimentActive }
				/>
			</ThemeProvider>
		</LocalizationProvider>
	</DirectionProvider>
);

ScannerApp.propTypes = {
	isRTL: PropTypes.bool,
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	lastReport: PropTypes.object,
	retryAt: PropTypes.string,
	isExperimentActive: PropTypes.bool,
};
