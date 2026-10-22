import {
	SCORE_TIER_HIGH,
	SCORE_TIER_HIGH_MIN,
	SCORE_TIER_LOW,
	SCORE_TIER_LOW_MAX,
	SCORE_TIER_MID,
} from './scanner-constants';

export const READINESS_SCORE_MAX = 100;

export const getScoreTier = ( score ) => {
	if ( score <= SCORE_TIER_LOW_MAX ) {
		return SCORE_TIER_LOW;
	}

	if ( score < SCORE_TIER_HIGH_MIN ) {
		return SCORE_TIER_MID;
	}

	return SCORE_TIER_HIGH;
};

export const getVisibleChecks = ( scan ) => scan?.checks ?? [];

export const getBaseScore = ( scan, isActivated ) => {
	if ( ! scan ) {
		return null;
	}

	const scoreAfterActivation = scan.activation?.scoreAfter;

	if ( isActivated && 'number' === typeof scoreAfterActivation ) {
		return scoreAfterActivation;
	}

	return 'number' === typeof scan.score ? scan.score : null;
};

const isCountedNow = ( check, countedIds ) => check.isLocal || !! countedIds[ check.id ];

export const getEarnedPoints = ( checks, resolvedIds, countedIds ) => checks
	.filter( ( check ) => resolvedIds[ check.id ] && isCountedNow( check, countedIds ) )
	.reduce( ( total, check ) => total + check.points, 0 );

export const hasUncountedFixes = ( checks, resolvedIds, countedIds ) => checks
	.some( ( check ) => resolvedIds[ check.id ] && ! isCountedNow( check, countedIds ) );

export const getActivationGain = ( scan ) => {
	const scoreAfterActivation = scan?.activation?.scoreAfter;

	if ( 'number' !== typeof scoreAfterActivation || 'number' !== typeof scan.score ) {
		return null;
	}

	return scoreAfterActivation - scan.score;
};

export const getMidpointScore = ( from, to ) => {
	if ( 'number' !== typeof from || 'number' !== typeof to ) {
		return from;
	}

	return Math.round( ( from + to ) / 2 );
};
