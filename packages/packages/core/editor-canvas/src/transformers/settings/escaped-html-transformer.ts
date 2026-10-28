import { sanitizeEscapedHtml } from '../../utils/sanitize-escaped-html';
import { createTransformer } from '../create-transformer';

export const escapedHtmlTransformer = createTransformer( ( value: string | null ) => {
	return sanitizeEscapedHtml( value );
} );
