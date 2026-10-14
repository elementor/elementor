import { escapedHtmlPropTypeUtil, htmlV3PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';

export function isEmpty( value: string | null = '' ) {
	if ( ! value ) {
		return true;
	}

	const pseudoElement = document.createElement( 'div' );

	pseudoElement.innerHTML = value;

	return ! pseudoElement.textContent?.length;
}

export function htmlToPlainText( html: string | null ): string {
	if ( ! html ) {
		return '';
	}

	const normalizedHtml = html.replace( /<br\s*\/?>/gi, '\n' ).replace( /<\/p>\s*<p[^>]*>/gi, '\n' );
	const doc = new DOMParser().parseFromString( normalizedHtml, 'text/html' );

	return doc.body.textContent ?? '';
}

export function extractInlineHtmlContent( propValue: unknown ): string {
	if ( escapedHtmlPropTypeUtil.isValid( propValue ) ) {
		return escapedHtmlPropTypeUtil.extract( propValue ) ?? '';
	}

	const htmlV3 = htmlV3PropTypeUtil.extract( propValue );

	return stringPropTypeUtil.extract( htmlV3?.content ?? null ) ?? '';
}
