import * as checkCopy from './scanner-check-copy';
import { classifyCheckFix } from './scanner-check-fixes';
import {
	CHECK_STATUS_PASS,
	FAILING_CHECK_STATUSES,
	getPriorityFromTier,
	OUTSIDE_SCAN_STATUS_FAILED,
	OUTSIDE_SCAN_STATUS_OK,
	STAGE_ACT,
	STAGE_COMMERCE,
	STAGE_IDENTIFY,
	STAGE_REACH,
} from './scanner-constants';
import { normalizeReadinessScore, READINESS_SCORE_MAX } from './scanner-score';

const LAYER_STAGES = {
	discovery: STAGE_REACH,
	accessibility: STAGE_IDENTIFY,
	usability: STAGE_ACT,
	payments: STAGE_COMMERCE,
};

const toNumber = ( value ) => ( 'number' === typeof value ? value : 0 );

const TASK_STAGES = {
	find: STAGE_REACH,
	read: STAGE_IDENTIFY,
	act: STAGE_ACT,
};

const toLowerKey = ( value ) => ( 'string' === typeof value ? value.toLowerCase() : '' );

const getCheckStage = ( check ) => TASK_STAGES[ toLowerKey( check.task ) ] ?? LAYER_STAGES[ toLowerKey( check.layer ) ];

const toStages = ( checks ) => Object.values( LAYER_STAGES ).map( ( stageId ) => {
	const stageChecks = checks.filter( ( check ) => check.scorable && getCheckStage( check ) === stageId );
	const total = stageChecks.length;

	return {
		id: stageId,
		earned: stageChecks.filter( ( check ) => CHECK_STATUS_PASS === check.status ).length,
		total,
		...( STAGE_COMMERCE === stageId && 0 === total ? { isComingSoon: true } : {} ),
	};
} );

const getActiveWeight = ( layers ) => Object.values( layers )
	.filter( ( layer ) => toNumber( layer?.possible ) > 0 )
	.reduce( ( total, layer ) => total + toNumber( layer.weight ), 0 );

// The score is a weighted average of layer percentages, so a check's points are its share of its layer scaled by that layer's weight.
const getScoreShare = ( checkPoints, layer, activeWeight ) => {
	const layerPossible = toNumber( layer?.possible );

	if ( ! checkPoints || ! layerPossible || ! activeWeight ) {
		return 0;
	}

	return Math.round( ( checkPoints / layerPossible ) * ( toNumber( layer.weight ) / activeWeight ) * READINESS_SCORE_MAX );
};

const getMissingPoints = ( check ) => ( check.scorable ? Math.max( 0, toNumber( check.possible ) - toNumber( check.earned ) ) : 0 );

const toFailingCheck = ( check, layers, activeWeight ) => {
	const classified = classifyCheckFix( check );

	return {
		id: check.id,
		title: checkCopy.getCheckTitle( check.id, check.label, false ),
		technicalName: check.label,
		points: getScoreShare( getMissingPoints( check ), layers[ check.layer ], activeWeight ),
		tier: check.tier,
		priority: getPriorityFromTier( check.tier ),
		status: check.status,
		stage: getCheckStage( check ),
		evidence: check.message ?? '',
		explanation: {
			whatItMeans: check.description ?? '',
			howToFix: classified.howToFix,
		},
		fixPrompt: classified.fixPrompt,
		fixWith: classified.fixWith,
		resolvedByActivation: classified.resolvedByActivation,
	};
};

const toPassingCheck = ( check, layers, activeWeight ) => ( {
	id: check.id,
	title: checkCopy.getCheckTitle( check.id, check.label, true ),
	technicalName: check.label,
	description: check.description ?? '',
	evidence: check.message ?? '',
	stage: getCheckStage( check ),
	points: getScoreShare( toNumber( check.earned ), layers[ check.layer ], activeWeight ),
} );

const byPointsDescending = ( first, second ) => second.points - first.points;

const toRetryTimestamp = ( retryAt ) => {
	const timestamp = retryAt ? Date.parse( retryAt ) : Number.NaN;

	return Number.isNaN( timestamp ) ? null : timestamp;
};

export const getLaterRetryAt = ( currentRetryAt, nextRetryAt ) => {
	const nextTimestamp = toRetryTimestamp( nextRetryAt );

	if ( null === nextTimestamp ) {
		return currentRetryAt ?? null;
	}

	const currentTimestamp = toRetryTimestamp( currentRetryAt );

	if ( null === currentTimestamp || nextTimestamp >= currentTimestamp ) {
		return nextRetryAt;
	}

	return currentRetryAt;
};

export const toScanResult = ( report, retryAt = null ) => {
	const layers = report?.layers ?? {};
	const checks = report?.checks ?? [];
	const activeWeight = getActiveWeight( layers );

	return {
		score: normalizeReadinessScore( report?.score ),
		ranAt: report?.scannedAt ?? null,
		retryAt: retryAt ?? report?.retryAt ?? null,
		stages: toStages( checks ),
		checks: checks
			.filter( ( check ) => FAILING_CHECK_STATUSES.includes( check.status ) )
			.map( ( check ) => toFailingCheck( check, layers, activeWeight ) )
			.sort( byPointsDescending ),
		passingChecks: checks
			.filter( ( check ) => CHECK_STATUS_PASS === check.status )
			.map( ( check ) => toPassingCheck( check, layers, activeWeight ) ),
		outsideScan: { status: OUTSIDE_SCAN_STATUS_OK, reason: null },
		activation: { scoreAfter: null },
	};
};

export const toFailedScanResult = ( reason = null ) => ( {
	score: null,
	ranAt: null,
	retryAt: null,
	stages: [],
	checks: [],
	passingChecks: [],
	outsideScan: { status: OUTSIDE_SCAN_STATUS_FAILED, reason },
	activation: { scoreAfter: null },
} );
