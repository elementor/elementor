export const ALLOWED_HTML_WRAPPER_TAGS = [
	'a',
	'article',
	'aside',
	'button',
	'form',
	'div',
	'footer',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'main',
	'nav',
	'p',
	'section',
	'span',
] as const;

export type AllowedHtmlTag = ( typeof ALLOWED_HTML_WRAPPER_TAGS )[ number ];
