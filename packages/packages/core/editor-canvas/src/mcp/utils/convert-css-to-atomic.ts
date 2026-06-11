import { type PropValue } from '@elementor/editor-props';
import { type HttpResponse, httpService } from '@elementor/http-client';

const CSS_TO_ATOMIC_URL = 'elementor/v1/css-to-atomic';
const SINGLE_BLOCK_KEY = 'default';

/**
 * A flat CSS property→value map. A null value is an explicit reset: the server emits it as a null
 * prop so the editor restores the property to its default.
 */
export type StyleDeclarations = Record< string, string | null >;

export type StyleBlock = StyleDeclarations | string;

export type CssConversionResult = {
	props: Record< string, PropValue | null >;
	customCss: string;
};

const convertBlocks = async (
	blocks: Record< string, StyleBlock >
): Promise< Record< string, CssConversionResult > > => {
	const { data } = await httpService().post< HttpResponse< Record< string, CssConversionResult > > >(
		CSS_TO_ATOMIC_URL,
		{ blocks }
	);

	return data.data;
};

export const convertStyleBlocksToAtomic = async (
	styleByName: Record< string, StyleBlock >
): Promise< Record< string, CssConversionResult > > => convertBlocks( styleByName );

export const convertCssToAtomic = async ( style: StyleDeclarations ): Promise< CssConversionResult > => {
	const results = await convertStyleBlocksToAtomic( { [ SINGLE_BLOCK_KEY ]: style } );

	return results[ SINGLE_BLOCK_KEY ];
};
