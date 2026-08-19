import DOMPurify from 'dompurify';

const ALLOWED_NON_OPERATIONAL_ATTRS = [
	'href',
	'target',
	'class',
	'id',
	'style',
	'title',
	'lang',
	'dir',
] as const;

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
		ALLOWED_ATTR: [ ...ALLOWED_NON_OPERATIONAL_ATTRS ],
		ALLOW_DATA_ATTR: true,
	} );
}
