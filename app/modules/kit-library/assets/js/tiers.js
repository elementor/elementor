// TODO: Check the access tier strings.
export const TIERS_PRIORITY = Object.freeze( [
	'free',
	'essential',
	'legacy',
	'advanced',
	'expert',
	'agency',
] );

/**
 * @type {Readonly<{
 *     free: string;
 *     essential: string;
 *     legacy: string;
 *     advanced: string;
 *     expert: string;
 *     agency: string;
 * }>}
 */
export const TIERS = Object.freeze(
	TIERS_PRIORITY.reduce( ( acc, tier ) => {
		acc[ tier ] = tier;

		return acc;
	}, {} ),
);

export const isTierAtLeast = ( currentTier, expectedTier ) => {
	const currentTierIndex = TIERS_PRIORITY.indexOf( currentTier );
	const expectedTierIndex = TIERS_PRIORITY.indexOf( expectedTier );

	if ( -1 === currentTierIndex || -1 === expectedTierIndex ) {
		return false;
	}

	return currentTierIndex >= expectedTierIndex;
};
