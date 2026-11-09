import { wpCli } from '../wp-cli';
import type { PromotionCdnPayload } from './constants';

const buildSeedEvalCommand = ( optionKey: string, payload: PromotionCdnPayload ): string => {
	const payloadBase64 = Buffer.from( JSON.stringify( payload ), 'utf8' ).toString( 'base64' );

	return `wp eval update_option('${ optionKey }',array('timeout'=>PHP_INT_MAX,'value'=>wp_json_encode(json_decode(base64_decode('${ payloadBase64 }'),true))));`;
};

export const seedPromotionCdnCache = async (
	optionKey: string,
	payload: PromotionCdnPayload,
): Promise<void> => {
	await wpCli( buildSeedEvalCommand( optionKey, payload ) );
};

export const clearPromotionCdnCache = async ( optionKey: string ): Promise<void> => {
	try {
		await wpCli( `wp option delete ${ optionKey }` );
	} catch {
		// Option may not exist.
	}
};
