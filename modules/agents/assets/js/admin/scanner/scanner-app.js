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
import { AngieInstallDialog } from './components/angie-install-dialog';
import { ErrorReportCard } from './components/error-report-card';
import { FirstRunView } from './components/first-run-view';
import { FixesSection } from './components/fixes-section';
import { HowToFixDialog } from './components/how-to-fix-dialog';
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
import { getLaterRetryAt, toScanResult } from './scanner-report-adapter';
import { useScannerFlow } from './use-scanner-flow';

const ScannerShell = ( { children, hideOverline, fillViewport } ) => (
	<Box
		boxSizing="border-box"
		sx={ fillViewport ? {
			backgroundColor: SCANNER_COLORS.paper,
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

const ScannerView = ( { flow, siteDomain, agentAccessUrl, seoPluginSearchUrl } ) => {
	const { view, scan } = flow;
	const isActivating = SCANNER_STATE_ACTIVATING === view;

	const renderActivateBanner = () => (
		<ActivateBanner
			isActivating={ isActivating }
			onActivate={ flow.activate }
			agentAccessUrl={ agentAccessUrl }
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
			{ flow.actionError && <Alert severity="error">{ flow.actionError }</Alert> }
			<FixesSection
				checks={ flow.visibleChecks }
				flow={ flow }
				agentAccessUrl={ agentAccessUrl }
				seoPluginSearchUrl={ seoPluginSearchUrl }
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
				seoPluginSearchUrl={ seoPluginSearchUrl }
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

const FixDialogs = ( { flow, angieInstallHeroUrl, angieAppUrl, angiePluginSearchUrl } ) => (
	<>
		{ flow.installCheck && (
			<AngieInstallDialog
				check={ flow.installCheck }
				heroUrl={ angieInstallHeroUrl }
				angieAppUrl={ angieAppUrl }
				angiePluginSearchUrl={ angiePluginSearchUrl }
				onClose={ flow.closeInstallDialog }
				onCopyPrompt={ flow.openHowToFix }
			/>
		) }
		{ flow.howToFixId && (
			<HowToFixDialog
				checks={ flow.visibleChecks }
				checkId={ flow.howToFixId }
				onClose={ flow.closeHowToFix }
				onShowCheck={ flow.showHowToFix }
			/>
		) }
	</>
);

FixDialogs.propTypes = {
	flow: PropTypes.object.isRequired,
	angieInstallHeroUrl: PropTypes.string.isRequired,
	angieAppUrl: PropTypes.string.isRequired,
	angiePluginSearchUrl: PropTypes.string.isRequired,
};

ScannerView.propTypes = {
	flow: PropTypes.object.isRequired,
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
};

const ScannerScreen = ( {
	siteDomain,
	agentAccessUrl,
	seoPluginSearchUrl,
	angieInstallHeroUrl,
	angieAppUrl,
	angiePluginSearchUrl,
	isActivated,
	isAngieActive,
	lastReport,
	retryAt = null,
	llmsConfig,
	markdownConfig,
	botAccessConfig,
	agentDiscoveryConfig,
	browserToolsConfig,
} ) => {
	const initialScan = useMemo(
		() => ( lastReport ? toScanResult( lastReport, getLaterRetryAt( lastReport.retryAt, retryAt ) ) : null ),
		[ lastReport, retryAt ],
	);
	const flow = useScannerFlow( {
		initialScan,
		initialRetryAt: lastReport ? null : retryAt,
		isActivated,
		isAngieActive,
		llmsConfig,
		markdownConfig,
		botAccessConfig,
		agentDiscoveryConfig,
		browserToolsConfig,
	} );
	const isFirstRun = SCANNER_STATE_FIRST_RUN === flow.view;
	const isScanProgress = SCANNER_STATE_PROGRESS === flow.view || SCANNER_STATE_ERROR_PROGRESS === flow.view;

	return (
		<ScannerShell hideOverline={ isFirstRun || isScanProgress } fillViewport={ isScanProgress }>
			<ScannerView
				flow={ flow }
				siteDomain={ siteDomain }
				agentAccessUrl={ agentAccessUrl }
				seoPluginSearchUrl={ seoPluginSearchUrl }
			/>
			<FixDialogs
				flow={ flow }
				angieInstallHeroUrl={ angieInstallHeroUrl }
				angieAppUrl={ angieAppUrl }
				angiePluginSearchUrl={ angiePluginSearchUrl }
			/>
		</ScannerShell>
	);
};

ScannerScreen.propTypes = {
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	angieInstallHeroUrl: PropTypes.string.isRequired,
	angieAppUrl: PropTypes.string.isRequired,
	angiePluginSearchUrl: PropTypes.string.isRequired,
	isActivated: PropTypes.bool,
	isAngieActive: PropTypes.bool,
	lastReport: PropTypes.object,
	retryAt: PropTypes.string,
	llmsConfig: PropTypes.object,
	markdownConfig: PropTypes.object,
	botAccessConfig: PropTypes.object,
	agentDiscoveryConfig: PropTypes.object,
	browserToolsConfig: PropTypes.object,
};

export const ScannerApp = ( {
	isRTL,
	siteDomain,
	agentAccessUrl,
	seoPluginSearchUrl = '',
	angieInstallHeroUrl = '',
	angieAppUrl = '',
	angiePluginSearchUrl = '',
	isActivated = false,
	isAngieActive = false,
	lastReport,
	retryAt = null,
	llmsConfig,
	markdownConfig,
	botAccessConfig,
	agentDiscoveryConfig,
	browserToolsConfig,
} ) => (
	<DirectionProvider rtl={ isRTL }>
		<LocalizationProvider>
			<ThemeProvider colorScheme="light" palette="argon-beta">
				<ScannerScreen
					siteDomain={ siteDomain }
					agentAccessUrl={ agentAccessUrl }
					seoPluginSearchUrl={ seoPluginSearchUrl }
					angieInstallHeroUrl={ angieInstallHeroUrl }
					angieAppUrl={ angieAppUrl }
					angiePluginSearchUrl={ angiePluginSearchUrl }
					isActivated={ isActivated }
					isAngieActive={ isAngieActive }
					lastReport={ lastReport }
					retryAt={ retryAt }
					llmsConfig={ llmsConfig }
					markdownConfig={ markdownConfig }
					botAccessConfig={ botAccessConfig }
					agentDiscoveryConfig={ agentDiscoveryConfig }
					browserToolsConfig={ browserToolsConfig }
				/>
			</ThemeProvider>
		</LocalizationProvider>
	</DirectionProvider>
);

ScannerApp.propTypes = {
	isRTL: PropTypes.bool,
	siteDomain: PropTypes.string.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string,
	angieInstallHeroUrl: PropTypes.string,
	angieAppUrl: PropTypes.string,
	angiePluginSearchUrl: PropTypes.string,
	isActivated: PropTypes.bool,
	isAngieActive: PropTypes.bool,
	lastReport: PropTypes.object,
	retryAt: PropTypes.string,
	llmsConfig: PropTypes.object,
	markdownConfig: PropTypes.object,
	botAccessConfig: PropTypes.object,
	agentDiscoveryConfig: PropTypes.object,
	browserToolsConfig: PropTypes.object,
};
