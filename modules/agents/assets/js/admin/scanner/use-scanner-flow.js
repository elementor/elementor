import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { activateAgentsReady, applyCheckFix, runSiteScan, undoCheckFix } from '../api';
import { getSaveErrorMessage } from '../hooks/get-save-error-message';
import { canOpenAngie, openAngieWithPrompt } from './open-angie';
import {
	getInitialModuleEnabled,
	getModuleUnavailableReason,
	getToggleModuleKey,
	hasDirtyModuleChecks,
	isAgentReadyModuleToggleDisabled,
} from './scanner-check-settings';
import {
	HTTP_TOO_MANY_REQUESTS,
	OUTSIDE_SCAN_STATUS_FAILED,
	SCANNER_DEFAULT_COOLDOWN_SECONDS,
	SCANNER_MOTION,
	SCANNER_STATE_ACTIVATING,
	SCANNER_STATE_ERROR_PROGRESS,
	SCANNER_STATE_ERROR_REPORT,
	SCANNER_STATE_FIRST_CHECK,
	SCANNER_STATE_FIRST_RUN,
	SCANNER_STATE_FIXES,
	SCANNER_STATE_PROGRESS,
	SCANNER_STATE_RESCANNING,
} from './scanner-constants';
import { getProgressStepDelaysMs, getProgressSteps } from './scanner-mock-data';
import { getLaterRetryAt, toFailedScanResult } from './scanner-report-adapter';
import { getBaseScore, getVisibleChecks, hasPendingFixes } from './scanner-score';

const MS_PER_SECOND = 1000;

const NOT_ACTIVATED_REASON = __( 'Activate Agent Ready to turn this on.', 'elementor' );

const wait = ( delayMs ) => new Promise( ( resolve ) => setTimeout( resolve, delayMs ) );

const getFallbackRetryAt = () => new Date( Date.now() + ( SCANNER_DEFAULT_COOLDOWN_SECONDS * MS_PER_SECOND ) ).toISOString();

const getThrottledRetryAt = ( error ) => error?.retryAt || getFallbackRetryAt();

const withoutKey = ( object, key ) => {
	const { [ key ]: _removed, ...rest } = object;

	return rest;
};

const getReportView = ( isActivated ) => ( isActivated ? SCANNER_STATE_FIXES : SCANNER_STATE_FIRST_CHECK );

const isThrottled = ( error ) => HTTP_TOO_MANY_REQUESTS === error?.status;

const isRetryAhead = ( retryAt ) => {
	const retryTimestamp = retryAt ? Date.parse( retryAt ) : Number.NaN;

	return ! Number.isNaN( retryTimestamp ) && retryTimestamp > Date.now();
};

const withFailedOutsideScan = ( scan, reason ) => ( {
	...( scan ?? toFailedScanResult() ),
	outsideScan: { status: OUTSIDE_SCAN_STATUS_FAILED, reason },
} );

const withModuleFlag = ( moduleEnabled, moduleKey, isEnabled ) => ( {
	...moduleEnabled,
	[ moduleKey ]: isEnabled,
} );

const withDirtyModuleKey = ( dirtyModuleKeys, moduleKey, isEnabled, initialModuleEnabled ) => (
	Boolean( initialModuleEnabled[ moduleKey ] ) === isEnabled
		? withoutKey( dirtyModuleKeys, moduleKey )
		: { ...dirtyModuleKeys, [ moduleKey ]: true }
);

export const useScannerFlow = ( {
	initialScan = null,
	initialRetryAt = null,
	isActivated: initialIsActivated = false,
	isAngieActive = false,
	llmsConfig,
	markdownConfig,
	botAccessConfig,
	agentDiscoveryConfig,
	browserToolsConfig,
} = {} ) => {
	const moduleConfigs = useMemo( () => ( {
		llmsConfig,
		markdownConfig,
		botAccessConfig,
		agentDiscoveryConfig,
		browserToolsConfig,
	} ), [ llmsConfig, markdownConfig, botAccessConfig, agentDiscoveryConfig, browserToolsConfig ] );
	const progressSteps = useMemo( getProgressSteps, [] );
	const isModuleToggleDisabled = useCallback(
		( moduleKey ) => isAgentReadyModuleToggleDisabled( moduleKey, moduleConfigs ),
		[ moduleConfigs ],
	);
	const isMountedRef = useRef( true );
	const initialModuleEnabledRef = useRef( getInitialModuleEnabled( {
		llmsConfig,
		markdownConfig,
		botAccessConfig,
		agentDiscoveryConfig,
		browserToolsConfig,
	} ) );
	const moduleEnabledRef = useRef( initialModuleEnabledRef.current );

	const [ view, setView ] = useState( initialScan ? getReportView( initialIsActivated ) : SCANNER_STATE_FIRST_RUN );
	const [ completedStepsCount, setCompletedStepsCount ] = useState( 0 );
	const [ scan, setScan ] = useState( initialScan );
	const [ cooldownRetryAt, setCooldownRetryAt ] = useState( initialRetryAt );
	const [ isActivated, setIsActivated ] = useState( initialIsActivated );
	const [ ringDurationMs, setRingDurationMs ] = useState( SCANNER_MOTION.ringArriveMs );
	const [ resolvedIds, setResolvedIds ] = useState( {} );
	const [ moduleEnabled, setModuleEnabled ] = useState( initialModuleEnabledRef.current );
	const [ dirtyModuleKeys, setDirtyModuleKeys ] = useState( {} );
	const [ savingModuleKeys, setSavingModuleKeys ] = useState( {} );
	const [ openIds, setOpenIds ] = useState( {} );
	const [ preferences, setPreferences ] = useState( {} );
	const [ areChecksExpanded, setAreChecksExpanded ] = useState( false );
	const [ actionError, setActionError ] = useState( '' );
	const [ installCheck, setInstallCheck ] = useState( null );
	const [ howToFixId, setHowToFixId ] = useState( null );
	const [ savingCheckIds, setSavingCheckIds ] = useState( {} );

	useEffect( () => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, [] );

	const playProgressStepsUntilScanGate = useCallback( async () => {
		const gateAt = progressSteps.length - 1;
		const progressStepDelaysMs = getProgressStepDelaysMs();

		for ( let step = 1; step <= gateAt; step++ ) {
			await wait( progressStepDelaysMs[ step - 1 ] );

			if ( ! isMountedRef.current ) {
				return;
			}

			setCompletedStepsCount( step );
		}
	}, [ progressSteps.length ] );

	const showScanFailure = useCallback( async () => {
		setView( SCANNER_STATE_ERROR_PROGRESS );
		await wait( SCANNER_MOTION.errorProgressPauseMs );

		if ( isMountedRef.current ) {
			setView( SCANNER_STATE_ERROR_REPORT );
		}
	}, [] );

	const retryAt = getLaterRetryAt( scan?.retryAt, cooldownRetryAt );

	const startScan = useCallback( async () => {
		if ( isRetryAhead( retryAt ) ) {
			return;
		}

		setActionError( '' );
		const isRescan = Boolean( scan );

		if ( isRescan ) {
			setView( SCANNER_STATE_RESCANNING );
		} else {
			setCompletedStepsCount( 0 );
			setView( SCANNER_STATE_PROGRESS );
		}

		let scanError = null;

		const scanPromise = runSiteScan().catch( ( error ) => {
			scanError = error;

			return null;
		} );

		const [ result ] = await Promise.all( [
			scanPromise,
			isRescan ? wait( SCANNER_MOTION.rescanMinMs ) : playProgressStepsUntilScanGate(),
		] );

		if ( ! isMountedRef.current ) {
			return;
		}

		if ( isThrottled( scanError ) ) {
			const throttledRetryAt = getThrottledRetryAt( scanError );

			setCooldownRetryAt( throttledRetryAt );

			if ( scan ) {
				const hasFailedOutsideScan = OUTSIDE_SCAN_STATUS_FAILED === scan.outsideScan?.status;

				setScan( { ...scan, retryAt: throttledRetryAt } );
				setView( hasFailedOutsideScan ? SCANNER_STATE_ERROR_REPORT : getReportView( isActivated ) );
				return;
			}

			setView( SCANNER_STATE_FIRST_RUN );
			return;
		}

		if ( ! result || OUTSIDE_SCAN_STATUS_FAILED === result.outsideScan?.status ) {
			setScan( result ?? withFailedOutsideScan( scan, scanError?.reason ?? null ) );

			if ( isRescan ) {
				setView( SCANNER_STATE_ERROR_REPORT );
				return;
			}

			await showScanFailure();
			return;
		}

		setCompletedStepsCount( progressSteps.length );
		setScan( result );
		setResolvedIds( {} );
		initialModuleEnabledRef.current = moduleEnabledRef.current;
		setDirtyModuleKeys( {} );
		setOpenIds( {} );
		setRingDurationMs( SCANNER_MOTION.ringArriveMs );
		setView( getReportView( isActivated ) );
	}, [ isActivated, playProgressStepsUntilScanGate, progressSteps.length, retryAt, showScanFailure, scan ] );

	const activate = useCallback( async () => {
		const previousView = view;

		setActionError( '' );
		setRingDurationMs( SCANNER_MOTION.ringActivatingMs );
		setView( SCANNER_STATE_ACTIVATING );

		try {
			await Promise.all( [ activateAgentsReady(), wait( SCANNER_MOTION.ringActivatingMs ) ] );
		} catch ( error ) {
			if ( isMountedRef.current ) {
				setActionError( getSaveErrorMessage( error ) );
				setView( previousView );
			}
			return;
		}

		if ( ! isMountedRef.current ) {
			return;
		}

		const nextModuleEnabled = getInitialModuleEnabled( moduleConfigs );
		Object.keys( nextModuleEnabled ).forEach( ( moduleKey ) => {
			if ( ! isModuleToggleDisabled( moduleKey ) ) {
				nextModuleEnabled[ moduleKey ] = true;
			}
		} );
		moduleEnabledRef.current = nextModuleEnabled;
		setModuleEnabled( nextModuleEnabled );
		setIsActivated( true );
		setOpenIds( {} );
		setRingDurationMs( SCANNER_MOTION.ringLandMs );
		setView( SCANNER_STATE_FIXES );
	}, [ isModuleToggleDisabled, moduleConfigs, view ] );

	const toggleRow = useCallback( ( checkId ) => {
		setOpenIds( ( current ) => ( current[ checkId ] ? withoutKey( current, checkId ) : { ...current, [ checkId ]: true } ) );
	}, [] );

	const openRow = useCallback( ( checkId ) => {
		setOpenIds( ( current ) => ( { ...current, [ checkId ]: true } ) );
	}, [] );

	const markResolved = useCallback( ( check, payload ) => {
		setActionError( '' );
		setResolvedIds( ( current ) => ( { ...current, [ check.id ]: payload } ) );
		setSavingCheckIds( ( current ) => ( { ...current, [ check.id ]: true } ) );

		applyCheckFix( check.id, payload )
			.catch( ( error ) => {
				if ( isMountedRef.current ) {
					setResolvedIds( ( current ) => withoutKey( current, check.id ) );
					setActionError( getSaveErrorMessage( error ) );
				}
			} )
			.finally( () => {
				if ( isMountedRef.current ) {
					setSavingCheckIds( ( current ) => withoutKey( current, check.id ) );
				}
			} );
	}, [] );

	const fixWithAngie = useCallback( ( check ) => {
		if ( canOpenAngie( isAngieActive ) ) {
			openAngieWithPrompt( check.fixPrompt );
			return;
		}

		setInstallCheck( check );
	}, [ isAngieActive ] );

	const openHowToFix = useCallback( ( check ) => {
		setInstallCheck( null );
		setHowToFixId( check.id );
	}, [] );

	const closeHowToFix = useCallback( () => {
		setHowToFixId( null );
	}, [] );

	const showHowToFix = useCallback( ( checkId ) => {
		setHowToFixId( checkId );
	}, [] );

	const closeInstallDialog = useCallback( () => {
		setInstallCheck( null );
	}, [] );

	const setModuleFlag = useCallback( ( moduleKey, isEnabled ) => {
		const nextModuleEnabled = withModuleFlag( moduleEnabledRef.current, moduleKey, isEnabled );

		moduleEnabledRef.current = nextModuleEnabled;
		setModuleEnabled( nextModuleEnabled );
		setDirtyModuleKeys( ( current ) => withDirtyModuleKey( current, moduleKey, isEnabled, initialModuleEnabledRef.current ) );
	}, [] );

	const setCheckEnabled = useCallback( ( check, isEnabled ) => {
		const moduleKey = getToggleModuleKey( check.id );

		if ( ! moduleKey ) {
			return;
		}

		const previousEnabled = Boolean( moduleEnabledRef.current[ moduleKey ] );

		if ( previousEnabled === isEnabled ) {
			return;
		}

		setActionError( '' );
		setModuleFlag( moduleKey, isEnabled );
		setSavingModuleKeys( ( current ) => ( { ...current, [ moduleKey ]: true } ) );

		const savePromise = isEnabled
			? applyCheckFix( check.id, { enabled: true } )
			: undoCheckFix( check.id );

		savePromise
			.catch( ( error ) => {
				if ( isMountedRef.current ) {
					setModuleFlag( moduleKey, previousEnabled );
					setActionError( getSaveErrorMessage( error ) );
				}
			} )
			.finally( () => {
				if ( isMountedRef.current ) {
					setSavingModuleKeys( ( current ) => withoutKey( current, moduleKey ) );
				}
			} );
	}, [ setModuleFlag ] );

	const undoFix = useCallback( ( check ) => {
		const moduleKey = getToggleModuleKey( check.id );

		if ( moduleKey ) {
			setCheckEnabled( check, false );
			return;
		}

		const previousPayload = resolvedIds[ check.id ];

		setActionError( '' );
		setResolvedIds( ( current ) => withoutKey( current, check.id ) );
		setSavingCheckIds( ( current ) => ( { ...current, [ check.id ]: true } ) );

		undoCheckFix( check.id )
			.catch( ( error ) => {
				if ( isMountedRef.current ) {
					setResolvedIds( ( current ) => ( { ...current, [ check.id ]: previousPayload } ) );
					setActionError( getSaveErrorMessage( error ) );
				}
			} )
			.finally( () => {
				if ( isMountedRef.current ) {
					setSavingCheckIds( ( current ) => withoutKey( current, check.id ) );
				}
			} );
	}, [ resolvedIds, setCheckEnabled ] );

	const setPreference = useCallback( ( checkId, value ) => {
		setPreferences( ( current ) => ( { ...current, [ checkId ]: value } ) );
	}, [] );

	const savePreference = useCallback( ( check ) => {
		const value = ( preferences[ check.id ] ?? '' ).trim();

		if ( ! value ) {
			return;
		}

		markResolved( check, { value } );
		setOpenIds( ( current ) => withoutKey( current, check.id ) );
	}, [ preferences, markResolved ] );

	const toggleChecksExpanded = useCallback( () => {
		setAreChecksExpanded( ( current ) => ! current );
	}, [] );

	// The server reason wins: it still applies after activation, while the activation hint does not.
	const getToggleDisabledReason = useCallback( ( moduleKey ) => {
		const unavailableReason = getModuleUnavailableReason( moduleKey, moduleConfigs );

		if ( unavailableReason ) {
			return unavailableReason.message || null;
		}

		return isActivated ? null : NOT_ACTIVATED_REASON;
	}, [ isActivated, moduleConfigs ] );

	const isCheckToggleDisabled = useCallback(
		( moduleKey ) => ! isActivated || isModuleToggleDisabled( moduleKey ),
		[ isActivated, isModuleToggleDisabled ],
	);

	const visibleChecks = getVisibleChecks( scan );

	return {
		view,
		progressSteps,
		completedStepsCount,
		scan,
		isActivated,
		visibleChecks,
		ringScore: getBaseScore( scan ),
		ringDurationMs,
		needsRescanForScore: hasPendingFixes( visibleChecks, resolvedIds ) || hasDirtyModuleChecks( visibleChecks, dirtyModuleKeys ),
		resolvedIds,
		moduleEnabled,
		isModuleToggleDisabled: isCheckToggleDisabled,
		getToggleDisabledReason,
		savingModuleKeys,
		openIds,
		preferences,
		areChecksExpanded,
		actionError,
		installCheck,
		howToFixId,
		savingCheckIds,
		retryAt,
		startScan,
		activate,
		toggleRow,
		openRow,
		openHowToFix,
		closeHowToFix,
		showHowToFix,
		closeInstallDialog,
		fixWithAngie,
		undoFix,
		setCheckEnabled,
		setPreference,
		savePreference,
		toggleChecksExpanded,
	};
};
