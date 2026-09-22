import { sanitizeSvgMarkup } from './sanitize-svg-markup';

const DEFAULT_UNITS_PER_EM = 1000;
const FETCH_TIMEOUT_MS = 4000;

export type IconFontLibraryRef = {
	prefix?: string;
	url?: string;
	enqueue?: string[];
	fetchJson?: string;
};

export type IconFontGlyph = {
	paths: string[];
	width: number;
	height: number;
	svgMarkup?: string;
};

type GlyphRecord = {
	name: string;
	paths: string[];
	width: number;
	height: number;
	ascent?: number;
	fromSvgFont?: boolean;
};

type IconFontIndex = {
	byName: Map< string, GlyphRecord >;
};

const fontIndexCache = new Map< string, Promise< IconFontIndex | null > >();

export function resetCustomIconFontCache() {
	fontIndexCache.clear();
}

export async function resolveIconFontGlyph(
	library: IconFontLibraryRef,
	iconName: string,
	nameCandidates: string[],
	signal?: AbortSignal
): Promise< IconFontGlyph | null > {
	const index = await getFontIndex( library, signal );

	if ( ! index ) {
		return null;
	}

	const names = [ iconName, ...nameCandidates ];

	for ( const name of names ) {
		const glyph = index.byName.get( name );

		if ( glyph && glyph.paths.length > 0 ) {
			return toIconFontGlyph( glyph );
		}
	}

	return null;
}

function toIconFontGlyph( glyph: GlyphRecord ): IconFontGlyph {
	const svgMarkup = buildGlyphSvg( glyph );

	return {
		paths: glyph.paths,
		width: glyph.width,
		height: glyph.height,
		svgMarkup: svgMarkup ?? undefined,
	};
}

function buildGlyphSvg( glyph: GlyphRecord ): string | null {
	if ( glyph.paths.length === 0 ) {
		return null;
	}

	const pathMarkup = glyph.paths.map( ( path ) => `<path d="${ escapeSvgPath( path ) }"></path>` ).join( '' );
	const content =
		glyph.fromSvgFont && glyph.ascent
			? `<g transform="matrix(1 0 0 -1 0 ${ glyph.ascent })">${ pathMarkup }</g>`
			: pathMarkup;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ glyph.width } ${ glyph.height }">${ content }</svg>`;

	return sanitizeSvgMarkup( svg );
}

function escapeSvgPath( path: string ): string {
	return path.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

async function getFontIndex( library: IconFontLibraryRef, signal?: AbortSignal ): Promise< IconFontIndex | null > {
	const cacheKey = library.fetchJson || library.url || library.enqueue?.[ 0 ] || '';

	if ( ! cacheKey ) {
		return null;
	}

	const cached = fontIndexCache.get( cacheKey );

	if ( cached ) {
		return cached;
	}

	const request = loadFontIndex( library, signal );
	fontIndexCache.set( cacheKey, request );

	return request;
}

async function loadFontIndex( library: IconFontLibraryRef, signal?: AbortSignal ): Promise< IconFontIndex | null > {
	const configIndex = await loadJsonGlyphIndex( library, signal );

	if ( configIndex && configIndex.byName.size > 0 ) {
		return configIndex;
	}

	return loadCssSvgFontIndex( library, signal );
}

async function loadJsonGlyphIndex(
	library: IconFontLibraryRef,
	signal?: AbortSignal
): Promise< IconFontIndex | null > {
	const urls = getConfigUrls( library );

	for ( const url of urls ) {
		const payload = await fetchJson( url, signal );
		const index = parseGlyphConfig( payload );

		if ( index && index.byName.size > 0 ) {
			return index;
		}
	}

	return null;
}

function getConfigUrls( library: IconFontLibraryRef ): string[] {
	const bases = [ library.fetchJson, library.url, ...( library.enqueue ?? [] ) ].filter(
		( url ): url is string => typeof url === 'string' && url !== ''
	);
	const urls: string[] = [];

	bases.forEach( ( base ) => {
		const directory = getDirectoryUrl( base );

		if ( ! directory ) {
			return;
		}

		urls.push( `${ directory }config.json` );
		urls.push( `${ directory }selection.json` );
	} );

	return [ ...new Set( urls ) ];
}

async function loadCssSvgFontIndex(
	library: IconFontLibraryRef,
	signal?: AbortSignal
): Promise< IconFontIndex | null > {
	const cssUrl = typeof library.url === 'string' && library.url !== '' ? library.url : library.enqueue?.[ 0 ];

	if ( ! cssUrl ) {
		return null;
	}

	const css = await fetchText( cssUrl, signal );

	if ( ! css ) {
		return null;
	}

	const unicodeByClass = parseCssUnicodeMap( css, library.prefix ?? '' );
	const svgFontUrls = getSvgFontUrls( cssUrl, css );

	for ( const svgUrl of svgFontUrls ) {
		const svgFont = await fetchText( svgUrl, signal );
		const index = parseSvgFont( svgFont, unicodeByClass );

		if ( index && index.byName.size > 0 ) {
			return index;
		}
	}

	return null;
}

function parseCssUnicodeMap( css: string, prefix: string ): Map< string, string > {
	const map = new Map< string, string >();
	const pattern = /\.([a-zA-Z0-9_-]+):before\s*\{[^}]*content:\s*['"]\\([0-9a-fA-F]+)['"]/g;
	let match = pattern.exec( css );

	while ( match ) {
		const className = match[ 1 ];
		const unicode = String.fromCodePoint( Number.parseInt( match[ 2 ], 16 ) );
		map.set( className, unicode );

		if ( prefix && className.startsWith( prefix ) ) {
			map.set( className.slice( prefix.length ), unicode );
		}

		match = pattern.exec( css );
	}

	return map;
}

function getSvgFontUrls( cssUrl: string, css: string ): string[] {
	const directory = getDirectoryUrl( cssUrl );
	const urls: string[] = [];
	const pattern = /url\((['"]?)([^'")]+?\.svg)(?:#[^'")]*)?\1\)/gi;
	let match = pattern.exec( css );

	while ( match ) {
		const resolved = resolveUrl( directory, match[ 2 ] );

		if ( resolved ) {
			urls.push( resolved );
		}

		match = pattern.exec( css );
	}

	return [ ...new Set( urls ) ];
}

function parseSvgFont( svgFont: string | null, unicodeByClass: Map< string, string > ): IconFontIndex | null {
	if ( ! svgFont ) {
		return null;
	}

	const unitsPerEm = readNumericAttribute( svgFont, 'units-per-em' ) ?? DEFAULT_UNITS_PER_EM;
	const ascent = readNumericAttribute( svgFont, 'ascent' ) ?? unitsPerEm;
	const byName = new Map< string, GlyphRecord >();
	const glyphPattern = /<glyph\b([^>]*)\/?>/gi;
	let match = glyphPattern.exec( svgFont );

	while ( match ) {
		const attributes = match[ 1 ];
		const path = readAttribute( attributes, 'd' );
		const glyphName = readAttribute( attributes, 'glyph-name' );
		const unicode = decodeUnicodeAttribute( readAttribute( attributes, 'unicode' ) );
		const width = readNumericAttribute( attributes, 'horiz-adv-x' ) ?? unitsPerEm;

		if ( ! path ) {
			match = glyphPattern.exec( svgFont );
			continue;
		}

		const record: GlyphRecord = {
			name: glyphName ?? unicode ?? '',
			paths: [ path ],
			width,
			height: unitsPerEm,
			ascent,
			fromSvgFont: true,
		};

		if ( glyphName ) {
			byName.set( glyphName, record );
		}

		if ( unicode ) {
			unicodeByClass.forEach( ( mappedUnicode, className ) => {
				if ( mappedUnicode === unicode ) {
					byName.set( className, record );
				}
			} );
		}

		match = glyphPattern.exec( svgFont );
	}

	return { byName };
}

function decodeUnicodeAttribute( value: string | null ): string | null {
	if ( ! value ) {
		return null;
	}

	const hexEntity = value.match( /^&#x([0-9a-fA-F]+);$/i );

	if ( hexEntity ) {
		return String.fromCodePoint( Number.parseInt( hexEntity[ 1 ], 16 ) );
	}

	const decEntity = value.match( /^&#([0-9]+);$/ );

	if ( decEntity ) {
		return String.fromCodePoint( Number.parseInt( decEntity[ 1 ], 10 ) );
	}

	return value;
}

function parseGlyphConfig( payload: unknown ): IconFontIndex | null {
	if ( ! payload || typeof payload !== 'object' ) {
		return null;
	}

	const byName = new Map< string, GlyphRecord >();
	const record = payload as {
		glyphs?: unknown;
		icons?: unknown;
		units_per_em?: unknown;
	};
	const unitsPerEm = typeof record.units_per_em === 'number' ? record.units_per_em : DEFAULT_UNITS_PER_EM;

	if ( Array.isArray( record.glyphs ) ) {
		record.glyphs.forEach( ( glyph ) => addFontelloGlyph( byName, glyph, unitsPerEm ) );
	}

	if ( Array.isArray( record.icons ) ) {
		record.icons.forEach( ( icon ) => addIcoMoonGlyph( byName, icon, unitsPerEm ) );
	}

	return byName.size > 0 ? { byName } : null;
}

function addFontelloGlyph( byName: Map< string, GlyphRecord >, glyph: unknown, unitsPerEm: number ) {
	if ( ! glyph || typeof glyph !== 'object' ) {
		return;
	}

	const entry = glyph as { css?: unknown; svg?: { path?: unknown; width?: unknown } };
	const name = typeof entry.css === 'string' ? entry.css : '';
	const path = typeof entry.svg?.path === 'string' ? entry.svg.path : '';

	if ( ! name || ! path ) {
		return;
	}

	const width = typeof entry.svg?.width === 'number' ? entry.svg.width : unitsPerEm;

	byName.set( name, {
		name,
		paths: [ path ],
		width,
		height: unitsPerEm,
	} );
}

function addIcoMoonGlyph( byName: Map< string, GlyphRecord >, icon: unknown, unitsPerEm: number ) {
	if ( ! icon || typeof icon !== 'object' ) {
		return;
	}

	const entry = icon as {
		properties?: { name?: unknown };
		icon?: { paths?: unknown; width?: unknown };
	};
	const name = typeof entry.properties?.name === 'string' ? entry.properties.name : '';
	const paths = Array.isArray( entry.icon?.paths )
		? entry.icon.paths.filter( ( path ): path is string => typeof path === 'string' && path !== '' )
		: [];

	if ( ! name || paths.length === 0 ) {
		return;
	}

	const width = typeof entry.icon?.width === 'number' ? entry.icon.width : unitsPerEm;

	byName.set( name, {
		name,
		paths,
		width,
		height: unitsPerEm,
	} );
}

function readAttribute( source: string, name: string ): string | null {
	const match = source.match( new RegExp( `${ name }="([^"]*)"`, 'i' ) );

	return match ? match[ 1 ] : null;
}

function readNumericAttribute( source: string, name: string ): number | null {
	const value = readAttribute( source, name );

	if ( ! value ) {
		return null;
	}

	const numeric = Number.parseFloat( value );

	return Number.isFinite( numeric ) ? numeric : null;
}

function getDirectoryUrl( url: string ): string | null {
	try {
		const parsed = new URL( url, window.location.href );

		return parsed.href.slice( 0, parsed.href.lastIndexOf( '/' ) + 1 );
	} catch {
		return null;
	}
}

function resolveUrl( directory: string | null, relative: string ): string | null {
	try {
		return new URL( relative, directory ?? window.location.href ).href.split( '#' )[ 0 ];
	} catch {
		return null;
	}
}

async function fetchJson( url: string, signal?: AbortSignal ): Promise< unknown > {
	const text = await fetchText( url, signal );

	if ( ! text ) {
		return null;
	}

	try {
		return JSON.parse( text );
	} catch {
		return null;
	}
}

async function fetchText( url: string, signal?: AbortSignal ): Promise< string | null > {
	const controller = new AbortController();
	const timeoutId = window.setTimeout( () => controller.abort(), FETCH_TIMEOUT_MS );
	const abortFromParent = () => controller.abort();

	signal?.addEventListener( 'abort', abortFromParent, { once: true } );

	try {
		const response = await fetch( url, { signal: controller.signal, mode: 'cors' } );

		if ( ! response.ok ) {
			return null;
		}

		return response.text();
	} catch {
		return null;
	} finally {
		window.clearTimeout( timeoutId );
		signal?.removeEventListener( 'abort', abortFromParent );
	}
}
