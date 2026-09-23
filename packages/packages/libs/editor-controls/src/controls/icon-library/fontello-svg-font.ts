type FontelloConfig = {
	glyphs?: Array< { css?: unknown; code?: unknown } >;
};

type GlyphRecord = {
	d: string;
	units: number;
	advance: number;
};

type GlyphIndex = {
	byName: Map< string, GlyphRecord >;
	byCode: Map< number, GlyphRecord >;
};

export function parseFontelloSvgFont(
	configJson: string,
	svgFont: string,
	prefix: string,
	displayPrefix: string,
	iconNames: string[]
): Record< string, string > {
	const codepoints = parseConfigCodepoints( configJson, prefix );
	const glyphs = parseSvgFontGlyphs( svgFont );
	const resolvedDisplayPrefix = displayPrefix || prefix.replace( /-$/, '' );
	const result: Record< string, string > = {};

	for ( const name of iconNames ) {
		const glyph = findGlyph( glyphs, codepoints, name, prefix );

		if ( ! glyph ) {
			continue;
		}

		const value = `${ resolvedDisplayPrefix } ${ prefix }${ name }`.trim();
		result[ value ] = buildIconSvg( glyph );
	}

	return result;
}

export function fontelloSvgUrlFromConfig( fetchJson: string ): string | null {
	try {
		const url = new URL( fetchJson, window.location.origin );
		url.pathname = url.pathname.replace( /\/[^/]+$/, '/font/fontello.svg' );

		return url.href;
	} catch {
		return null;
	}
}

function parseConfigCodepoints( configJson: string, prefix: string ): Map< string, number > {
	const map = new Map< string, number >();

	try {
		const data = JSON.parse( configJson ) as FontelloConfig;

		if ( ! Array.isArray( data.glyphs ) ) {
			return map;
		}

		for ( const glyph of data.glyphs ) {
			if ( typeof glyph.css !== 'string' || glyph.css === '' || typeof glyph.code !== 'number' ) {
				continue;
			}

			map.set( glyph.css, glyph.code );

			if ( prefix !== '' && ! glyph.css.startsWith( prefix ) ) {
				map.set( `${ prefix }${ glyph.css }`, glyph.code );
			}
		}
	} catch {
		return map;
	}

	return map;
}

function parseSvgFontGlyphs( svgFont: string ): GlyphIndex {
	const byName = new Map< string, GlyphRecord >();
	const byCode = new Map< number, GlyphRecord >();
	const doc = new DOMParser().parseFromString( stripDoctype( svgFont ), 'image/svg+xml' );
	const font = doc.querySelector( 'font' );
	const face = doc.querySelector( 'font-face' );
	const fontAdvance = positiveInt( font?.getAttribute( 'horiz-adv-x' ), 1000 );
	const units = positiveInt( face?.getAttribute( 'units-per-em' ), fontAdvance );

	doc.querySelectorAll( 'glyph' ).forEach( ( node ) => {
		const d = node.getAttribute( 'd' ) ?? '';

		if ( d === '' ) {
			return;
		}

		const record: GlyphRecord = {
			d,
			units,
			advance: positiveInt( node.getAttribute( 'horiz-adv-x' ), fontAdvance ),
		};
		const name = node.getAttribute( 'glyph-name' ) ?? '';
		const unicode = node.getAttribute( 'unicode' ) ?? '';
		const code = unicode.codePointAt( 0 );

		if ( name ) {
			byName.set( name, record );
		}

		if ( code !== undefined ) {
			byCode.set( code, record );
		}
	} );

	return { byName, byCode };
}

function findGlyph(
	glyphs: GlyphIndex,
	codepoints: Map< string, number >,
	iconName: string,
	prefix: string
): GlyphRecord | null {
	const names = [ iconName ];

	if ( prefix !== '' && iconName.startsWith( prefix ) ) {
		names.push( iconName.slice( prefix.length ) );
	}

	for ( const name of names ) {
		const byName = glyphs.byName.get( name );

		if ( byName ) {
			return byName;
		}

		const code = codepoints.get( name );
		const byCode = code !== undefined ? glyphs.byCode.get( code ) : undefined;

		if ( byCode ) {
			return byCode;
		}
	}

	return null;
}

function buildIconSvg( glyph: GlyphRecord ): string {
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ glyph.advance } ${ glyph.units }">` +
		`<g transform="translate(0,${ glyph.units }) scale(1,-1)">` +
		`<path d="${ escapeAttribute( glyph.d ) }"></path>` +
		`</g></svg>`
	);
}

function stripDoctype( svgFont: string ): string {
	return svgFont.replace( /<!DOCTYPE[^>]*>/si, '' );
}

function positiveInt( value: string | null | undefined, fallback: number ): number {
	if ( ! value ) {
		return fallback;
	}

	const parsed = Number.parseInt( value, 10 );

	return parsed > 0 ? parsed : fallback;
}

function escapeAttribute( value: string ): string {
	return value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}
