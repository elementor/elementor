const ALLOWED_SVG_TAGS = new Set( [ 'svg', 'g', 'path', 'title', 'desc' ] );
const ALLOWED_SVG_ATTRS = new Set( [
	'd',
	'fill',
	'viewbox',
	'xmlns',
	'width',
	'height',
	'transform',
	'overflow',
	'aria-hidden',
	'aria-label',
	'role',
] );

export function sanitizeIconSvgMarkup( markup: unknown ): string {
	if ( typeof markup !== 'string' || markup === '' ) {
		return '';
	}

	const doc = new DOMParser().parseFromString( markup, 'image/svg+xml' );

	if ( doc.querySelector( 'parsererror' ) ) {
		return '';
	}

	const svg = doc.querySelector( 'svg' );

	if ( ! svg ) {
		return '';
	}

	pruneNode( svg );

	return svg.tagName.toLowerCase() === 'svg' ? svg.outerHTML : '';
}

function pruneNode( node: Element ): void {
	[ ...node.children ].forEach( ( child ) => {
		if ( ! ALLOWED_SVG_TAGS.has( child.tagName.toLowerCase() ) ) {
			child.remove();
			return;
		}

		pruneNode( child );
	} );

	[ ...node.attributes ].forEach( ( attribute ) => {
		if ( ! ALLOWED_SVG_ATTRS.has( attribute.name.toLowerCase() ) ) {
			node.removeAttribute( attribute.name );
		}
	} );
}
