import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

const baseUtil = createPropUtils( 'font-family', z.string().nullable() );

export const fontFamilyPropTypeUtil = Object.assign( baseUtil, {
	getEnqueueFontFamily: ( value: string ) => {
		const trimmed = value.trim();
		const commaIndex = trimmed.indexOf( ',' );
		const family =
			-1 === commaIndex || trimmed.slice( 0, commaIndex ).includes( '(' )
				? trimmed
				: trimmed.slice( 0, commaIndex ).trim();

		if ( family.includes( '(' ) ) {
			return '';
		}

		if (
			( family.startsWith( '"' ) && family.endsWith( '"' ) ) ||
			( family.startsWith( "'" ) && family.endsWith( "'" ) )
		) {
			return family.slice( 1, -1 ).trim();
		}

		return family;
	},
} );

export type FontFamilyPropValue = z.infer< typeof fontFamilyPropTypeUtil.schema >;
