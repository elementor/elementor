import { createTransformer } from '../create-transformer';

type HtmlV2Value = {
	content?: string | null;
	children?: unknown;
};

export const htmlV2Transformer = createTransformer( ( value: unknown ) => {
	if ( typeof value === 'string' || value === null ) {
		return value ?? '';
	}

	if ( typeof value === 'object' && value !== null && 'content' in value ) {
		return ( value as HtmlV2Value ).content ?? '';
	}

	return '';
} );
