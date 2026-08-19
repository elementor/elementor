import DOMPurify from 'dompurify';

function getAllowedHtmlWrapperTags(): readonly string[] {
	return window.elementorCommon?.config?.allowedHTMLWrapperTags ?? [];
}

export function sanitizeEscapedHtml( value: string | null ): string {
	if ( ! value ) {
		return '';
	}

	const allowedTags = [ ...getAllowedHtmlWrapperTags() ];

	return DOMPurify.sanitize( value, {
		ALLOWED_TAGS: allowedTags,
		ALLOWED_ATTR: [ 'href', 'target' ],
	} );
}
