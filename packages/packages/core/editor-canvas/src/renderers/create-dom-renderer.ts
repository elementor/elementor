import { createArrayLoader, createEnvironment, type TwingArrayLoader, type TwingEnvironment } from '@elementor/twing';

export type DomRenderer = {
	register: TwingArrayLoader[ 'setTemplate' ];
	render: TwingEnvironment[ 'render' ];
};

export const DEFAULT_ALLOWED_HTML_WRAPPER_TAGS = [
	'a',
	'article',
	'aside',
	'button',
	'div',
	'footer',
	'form',
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

export function createDomRenderer(): DomRenderer {
	const loader = createArrayLoader( {} );
	const environment = createEnvironment( loader );

	environment.registerEscapingStrategy( escapeHtmlTag, 'html_tag' );
	environment.registerEscapingStrategy( escapeURL, 'full_url' );

	return {
		register: loader.setTemplate,
		render: environment.render,
	};
}

function getAllowedHtmlWrapperTags(): readonly string[] {
	const configTags = window.elementorCommon?.config?.allowedHTMLWrapperTags;

	if ( Array.isArray( configTags ) ) {
		return configTags;
	}

	return DEFAULT_ALLOWED_HTML_WRAPPER_TAGS;
}

function escapeHtmlTag( value: string ) {
	const allowedTags = getAllowedHtmlWrapperTags();
	const normalizedTag = value?.toLowerCase?.() ?? '';

	return allowedTags.includes( normalizedTag ) ? value : 'div';
}

function escapeURL( value: string ) {
	const allowedProtocols = [ 'http:', 'https:', 'mailto:', 'tel:' ];

	try {
		const parsed = new URL( value );

		return allowedProtocols.includes( parsed.protocol ) ? value : '';
	} catch {
		return '';
	}
}
