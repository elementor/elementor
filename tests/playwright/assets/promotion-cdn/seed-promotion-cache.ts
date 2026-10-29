import { wpCli } from '../wp-cli';
import type { PromotionCdnPayload } from './constants';

const encodePayloadForWpEval = ( payload: PromotionCdnPayload ): string => {
	return JSON.stringify( payload )
		.replace( /\\/g, '\\\\' )
		.replace( /'/g, "\\'" );
};

export const seedPromotionCdnCache = async (
	optionKey: string,
	payload: PromotionCdnPayload,
): Promise<void> => {
	const encodedPayload = encodePayloadForWpEval( payload );

	await wpCli(
		`wp eval "update_option('${ optionKey }', array( 'timeout' => PHP_INT_MAX, 'value' => '${ encodedPayload }' ) );"`,
	);
};

export const clearPromotionCdnCache = async ( optionKey: string ): Promise<void> => {
	try {
		await wpCli( `wp option delete ${ optionKey }` );
	} catch {
		// Option may not exist.
	}
};
