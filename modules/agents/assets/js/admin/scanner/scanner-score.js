import {
	SCORE_TIER_HIGH,
	SCORE_TIER_LOW,
	SCORE_TIER_MID,
} from './scanner-constants';

export const READINESS_SCORE_MAX = 100;

const getScoreTierThresholds = () => window.elementorAgentsReadyConfig.scanner.scoreTiers;

export const getScoreTier = ( score ) => {
	const { lowMax, highMin } = getScoreTierThresholds();

	if ( score <= lowMax ) {
		return SCORE_TIER_LOW;
	}

	if ( score < highMin ) {
		return SCORE_TIER_MID;
	}

	return SCORE_TIER_HIGH;
};

export const getStagePassPercent = ( stage ) => {
	if ( stage.isComingSoon || stage.total <= 0 ) {
		return null;
	}

	return normalizeReadinessScore( ( stage.earned / stage.total ) * READINESS_SCORE_MAX );
};

export const getStageHealthTier = ( stage ) => {
	const passPercent = getStagePassPercent( stage );

	return null === passPercent ? null : getScoreTier( passPercent );
};

export const getVisibleChecks = ( scan ) => scan?.checks ?? [];

export const normalizeReadinessScore = ( score ) => {
	if ( 'number' !== typeof score ) {
		return null;
	}

	return Math.round( Math.min( Math.max( score, 0 ), READINESS_SCORE_MAX ) );
};

export const getBaseScore = ( scan ) => normalizeReadinessScore( scan?.score );

export const hasPendingFixes = ( checks, resolvedIds ) => checks.some( ( check ) => resolvedIds[ check.id ] );
