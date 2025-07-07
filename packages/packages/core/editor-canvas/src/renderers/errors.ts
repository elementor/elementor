import { createError } from '@elementor/utils';

export const UnknownStyleTypeError = createError< { type: string } >( {
	code: 'unknown_style_type',
	message: 'Unknown style type',
} );
