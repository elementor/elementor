import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

const baseUtil = createPropUtils( 'font-family', z.string().nullable() );

const unquote = ( value: string ): string => {
	const isQuoted =
		( value.startsWith( '"' ) && value.endsWith( '"' ) ) ||
		( value.startsWith( "'" ) && value.endsWith( "'" ) );

	return isQuoted ? value.slice( 1, -1 ).trim() : value;
};

const takeFirstFamily = ( value: string ): string => {
	const commaIndex = value.indexOf( ',' );
	const openParenIndex = value.indexOf( '(' );
	const commaSeparatesStack = -1 !== commaIndex && ( -1 === openParenIndex || commaIndex < openParenIndex );

	return commaSeparatesStack ? value.slice( 0, commaIndex ).trim() : value;
};

export const fontFamilyPropTypeUtil = Object.assign( baseUtil, {
	getEnqueueFontFamily: ( value: string ) => {
		const family = takeFirstFamily( value.trim() );

		return family.includes( '(' ) ? '' : unquote( family );
	},
} );

export type FontFamilyPropValue = z.infer< typeof fontFamilyPropTypeUtil.schema >;
