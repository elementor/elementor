import { type PropValue } from '@elementor/editor-props';
import { type HttpResponse, httpService } from '@elementor/http-client';

const CSS_TO_ATOMIC_URL = 'elementor/v1/css-to-atomic';
const SINGLE_BLOCK_KEY = 'default';

export type CssConversionResult = {
	props: Record< string, PropValue >;
	customCss: string;
};

const styleRecordToCssText = ( style: Record< string, string > ): string =>
	Object.entries( style )
		.map( ( [ property, value ] ) => `${ property }: ${ value };` )
		.join( ' ' );

const convertCssBlocks = async (
	blocks: Record< string, string >
): Promise< Record< string, CssConversionResult > > => {
	const { data } = await httpService().post< HttpResponse< Record< string, CssConversionResult > > >(
		CSS_TO_ATOMIC_URL,
		{ blocks }
	);

	return data.data;
};

export const convertStyleBlocksToAtomic = async (
	styleByName: Record< string, Record< string, string > >
): Promise< Record< string, CssConversionResult > > => {
	const blocks = Object.fromEntries(
		Object.entries( styleByName ).map( ( [ name, style ] ) => [ name, styleRecordToCssText( style ) ] )
	);

	return convertCssBlocks( blocks );
};

export const convertCssToAtomic = async ( style: Record< string, string > ): Promise< CssConversionResult > => {
	const results = await convertStyleBlocksToAtomic( { [ SINGLE_BLOCK_KEY ]: style } );

	return results[ SINGLE_BLOCK_KEY ];
};
