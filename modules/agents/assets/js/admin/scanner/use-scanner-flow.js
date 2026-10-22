import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { activateAgentsReady, applyCheckFix, runSiteScan, undoCheckFix } from '../api';
import { getSaveErrorMessage } from '../hooks/get-save-error-message';
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
import { getProgressSteps } from './scanner-mock-data';
import { getLaterRetryAt, toFailedScanResult } from './scanner-report-adapter';
import {
	getActivationGain,
	getBaseScore,
	getEarnedPoints,
	getMidpointScore,
	getVisibleChecks,
	hasUncountedFixes,
} from './scanner-score';

const MS_PER_SECOND = 1000;

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

export const useScannerFlow = ( { initialScan = null, initialRetryAt = null, isExperimentActive = false } = {} ) => {
	const progressSteps = useMemo( getProgressSteps, [] );
	const isMountedRef = useRef( true );

	const [ view, setView ] = useState( initialScan ? getReportView( isExperimentActive ) : SCANNER_STATE_FIRST_RUN );
	const [ completedStepsCount, setCompletedStepsCount ] = useState( 0 );
	const [ scan, setScan ] = useState( initialScan );
	const [ cooldownRetryAt, setCooldownRetryAt ] = useState( initialRetryAt );
	const [ isActivated, setIsActivated ] = useState( isExperimentActive );
	const [ ringDurationMs, setRingDurationMs ] = useState( SCANNER_MOTION.ringArriveMs );
	const [ resolvedIds, setResolvedIds ] = useState( {} );
	const [ countedIds, setCountedIds ] = useState( {} );
	const [ openIds, setOpenIds ] = useState( {} );
	const [ preferences, setPreferences ] = useState( {} );
	const [ areChecksExpanded, setAreChecksExpanded ] = useState( false );
	const [ actionError, setActionError ] = useState( '' );

	useEffect( () => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, [] );

	useEffect( () => {
		if ( ! isExperimentActive ) {
			return;
		}

		setIsActivated( true );
		setView( ( current ) => {
			if ( SCANNER_STATE_FIRST_CHECK === current && scan ) {
				return SCANNER_STATE_FIXES;
			}

			return current;
		} );
	}, [ isExperimentActive, scan ] );

	const playProgressSteps = useCallback( async () => {
		for ( let step = 1; step <= progressSteps.length; step++ ) {
			await wait( SCANNER_MOTION.progressStepMs );

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
			isRescan ? wait( SCANNER_MOTION.rescanMinMs ) : playProgressSteps(),
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

		// TODO: Once the endpoint reports resolved checks as passing, replace this local carry-over with the scan result's own check statuses.
		setScan( result );
		setCountedIds( resolvedIds );
		setOpenIds( {} );
		setRingDurationMs( SCANNER_MOTION.ringArriveMs );
		setView( getReportView( isActivated ) );
	}, [ isActivated, playProgressSteps, retryAt, showScanFailure, scan, resolvedIds ] );

	const activate = useCallback( async () => {
		const previousView = view;

		setActionError( '' );
		setRingDurationMs( SCANNER_MOTION.ringActivatingMs );
		setView( SCANNER_STATE_ACTIVATING );

		try {
			// TODO: activateAgentsReady() only flips the agent_ready experiment opt-in. Replace with the endpoint that turns on every Agent Ready module and reports which checks it resolved (handoff §10.1).
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

		setIsActivated( true );
		setOpenIds( {} );
		setRingDurationMs( SCANNER_MOTION.ringLandMs );
		setView( SCANNER_STATE_FIXES );
	}, [ view ] );

	const toggleRow = useCallback( ( checkId ) => {
		setOpenIds( ( current ) => ( current[ checkId ] ? withoutKey( current, checkId ) : { ...current, [ checkId ]: true } ) );
	}, [] );

	const openRow = useCallback( ( checkId ) => {
		setOpenIds( ( current ) => ( { ...current, [ checkId ]: true } ) );
	}, [] );

	const markResolved = useCallback( ( check, payload ) => {
		setActionError( '' );
		setRingDurationMs( SCANNER_MOTION.ringLocalUpdateMs );
		setResolvedIds( ( current ) => ( { ...current, [ check.id ]: payload } ) );

		applyCheckFix( check.id, payload ).catch( ( error ) => {
			if ( isMountedRef.current ) {
				setResolvedIds( ( current ) => withoutKey( current, check.id ) );
				setActionError( getSaveErrorMessage( error ) );
			}
		} );
	}, [] );

	const undoFix = useCallback( ( check ) => {
		const previousPayload = resolvedIds[ check.id ];

		setActionError( '' );
		setRingDurationMs( SCANNER_MOTION.ringLocalUpdateMs );
		setResolvedIds( ( current ) => withoutKey( current, check.id ) );
		setCountedIds( ( current ) => withoutKey( current, check.id ) );

		undoCheckFix( check.id ).catch( ( error ) => {
			if ( isMountedRef.current ) {
				setResolvedIds( ( current ) => ( { ...current, [ check.id ]: previousPayload } ) );
				setActionError( getSaveErrorMessage( error ) );
			}
		} );
	}, [ resolvedIds ] );

	const fixWithAngie = useCallback( ( check ) => {
		// TODO: Hand the check over to Angie and resolve the row only once Angie reports the fix as applied.
		markResolved( check, { source: 'angie' } );
	}, [ markResolved ] );

	const setCheckEnabled = useCallback( ( check, isEnabled ) => {
		if ( isEnabled ) {
			markResolved( check, { enabled: true } );
			return;
		}

		undoFix( check );
	}, [ markResolved, undoFix ] );

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

	const visibleChecks = getVisibleChecks( scan );
	const baseScore = getBaseScore( scan, isActivated );
	const displayScore = null === baseScore ? null : baseScore + getEarnedPoints( visibleChecks, resolvedIds, countedIds );
	const ringScore = SCANNER_STATE_ACTIVATING === view
		? getMidpointScore( baseScore, scan?.activation?.scoreAfter )
		: displayScore;

	return {
		view,
		progressSteps,
		completedStepsCount,
		scan,
		isActivated,
		visibleChecks,
		activationResolvedChecks: ( scan?.checks ?? [] ).filter( ( check ) => check.resolvedByActivation ),
		activationGain: getActivationGain( scan ),
		ringScore,
		ringDurationMs,
		needsRescanForScore: hasUncountedFixes( visibleChecks, resolvedIds, countedIds ),
		resolvedIds,
		openIds,
		preferences,
		areChecksExpanded,
		actionError,
		retryAt,
		startScan,
		activate,
		toggleRow,
		openRow,
		fixWithAngie,
		undoFix,
		setCheckEnabled,
		setPreference,
		savePreference,
		toggleChecksExpanded,
	};
};
