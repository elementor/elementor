import DOMPurify from 'dompurify';

const SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: unset;';

export function processSvgContent( svgText: string ): string | null {
	const sanitized = DOMPurify.sanitize( svgText, {
		USE_PROFILES: { svg: true, svgFilters: true },
	} );

	const parser = new DOMParser();
	const doc = parser.parseFromString( sanitized, 'image/svg+xml' );
	const svgElement = doc.querySelector( 'svg' );

	if ( ! svgElement ) {
		return null;
	}

	svgElement.setAttribute( 'fill', 'currentColor' );

	const existingStyle = svgElement.getAttribute( 'style' ) ?? '';
	const trimmed = existingStyle.trim();
	const merged = trimmed ? `${ trimmed.replace( /;$/, '' ) }; ${ SVG_INLINE_STYLES }` : SVG_INLINE_STYLES;
	svgElement.setAttribute( 'style', merged );

	return svgElement.outerHTML;
}
