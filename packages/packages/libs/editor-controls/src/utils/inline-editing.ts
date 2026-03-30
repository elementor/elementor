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

	const div = document.createElement( 'div' );

	div.innerHTML = html.replace( /<br\s*\/?>/gi, '\n' ).replace( /<\/p>\s*<p[^>]*>/gi, '\n' );

	return div.textContent ?? '';
}
