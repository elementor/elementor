import { createArrayLoader, createEnvironment, type TwingArrayLoader, type TwingEnvironment } from '@elementor/twing';

export type DomRenderer = {
	register: TwingArrayLoader[ 'setTemplate' ];
	render: TwingEnvironment[ 'render' ];
};

export function createDomRenderer(): DomRenderer {
	const loader = createArrayLoader( {} );
	const environment = createEnvironment( loader );

	environment.registerEscapingStrategy( escapeHtmlTag, 'html_tag' );
	environment.registerEscapingStrategy( escapeURL, 'full_url' );
	environment.registerEscapingStrategy( escapeJsIdentifier, 'js_identifier' );

	return {
		register: loader.setTemplate,
		render: ( name, context, options ) => environment.render( name, context, options ),
	};
}

/**
 * PHP (`Utils::get_allowed_html_wrapper_tags()`) is the single source of truth for this
 * list; it's localized via `elementorCommon.config`. If it's ever missing, fail closed
 * (no tags allowed) rather than fall back to a second hardcoded copy that could drift.
 */
function getAllowedHtmlWrapperTags(): readonly string[] {
	return window.elementorCommon?.config?.allowedHTMLWrapperTags ?? [];
}

function escapeHtmlTag( value: string ) {
	const allowedTags = getAllowedHtmlWrapperTags();
	const normalizedTag = value?.toLowerCase?.() ?? '';

	return allowedTags.includes( normalizedTag ) ? value : 'div';
}

const JS_IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;

function escapeJsIdentifier( value: unknown ): string {
	const id = String( value ?? '' );
	const match = id.match( JS_IDENTIFIER_PATTERN );

	return match?.[ 0 ] === id ? id : '';
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
