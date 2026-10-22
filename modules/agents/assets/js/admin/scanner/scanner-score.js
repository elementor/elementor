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

export const getBaseScore = ( scan ) => ( 'number' === typeof scan?.score ? scan.score : null );

export const hasPendingFixes = ( checks, resolvedIds ) => checks.some( ( check ) => resolvedIds[ check.id ] );
