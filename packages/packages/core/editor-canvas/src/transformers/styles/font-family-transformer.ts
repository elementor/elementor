import { fontFamilyPropTypeUtil } from '@elementor/editor-props';

import { createTransformer } from '../create-transformer';

export const fontFamilyTransformer = createTransformer( ( value: string | null ) => {
	if ( typeof value !== 'string' ) {
		return null;
	}

	return fontFamilyPropTypeUtil.formatForCss( value );
} );
