import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

const baseUtil = createPropUtils( 'font-family', z.string().nullable() );

export const fontFamilyPropTypeUtil = Object.assign( baseUtil, {
	getEnqueueFontFamily: ( value: string ) => {
		const trimmed = value.trim();

		if (
			( trimmed.startsWith( '"' ) && trimmed.endsWith( '"' ) ) ||
			( trimmed.startsWith( "'" ) && trimmed.endsWith( "'" ) )
		) {
			return trimmed.slice( 1, -1 ).trim();
		}

		return trimmed;
	},
} );

export type FontFamilyPropValue = z.infer< typeof fontFamilyPropTypeUtil.schema >;
