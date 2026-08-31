import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';
import { processSvgContent } from './process-svg-content';

type IconValue = {
	value?: unknown;
	library?: unknown;
};

type FontAwesomeIconJson = [ number, number, unknown[], unknown, string | string[] ];

type FontAwesome7EditorConfig = {
	jsonFiles: string[];
	jsonBaseUrl: string;
};

const FONT_AWESOME_JSON = {
	width: 0,
	height: 1,
	aliases: 2,
	unicode: 3,
	path: 4,
} as const;

const FONT_AWESOME_LIBRARY_PREFIX = 'fa-';

const fontAwesomeJsonCache = new Map< string, Record< string, FontAwesomeIconJson > >();

export const iconTransformer = createTransformer( async ( value: IconValue, { signal }: TransformerOptions ) => {
	const iconValue = typeof value.value === 'string' ? value.value : null;
	const library = typeof value.library === 'string' ? value.library : null;

	if ( ! iconValue || ! library ) {
		return { html: null, url: null };
	}

	const iconName = getFontAwesomeIconName( iconValue );
	const jsonFileName = getFontAwesomeJsonFileName( library );

	if ( ! iconName || ! jsonFileName ) {
		return { html: null, url: null };
	}

	const icons = await fetchFontAwesomeIcons( jsonFileName, signal );
	const iconData = icons?.[ iconName ];

	if ( ! iconData ) {
		return { html: null, url: null };
	}

	const svgText = buildFontAwesomeSvg( iconData );

	if ( ! svgText ) {
		return { html: null, url: null };
	}

	const html = processIconSvgContent( svgText );

	return { html, url: null };
} );

function getFontAwesomeIconName( iconValue: string ): string | null {
	const match = iconValue.match( /^fa\S*\s+fa-(.+)$/ );

	return match?.[ 1 ] ?? null;
}

function getFontAwesomeJsonFileName( library: string ): string | null {
	if ( ! library.startsWith( FONT_AWESOME_LIBRARY_PREFIX ) ) {
		return null;
	}

	const fileName = library.slice( FONT_AWESOME_LIBRARY_PREFIX.length );
	const config = getFontAwesome7EditorConfig();

	if ( ! config?.jsonFiles.includes( fileName ) ) {
		return null;
	}

	return fileName;
}

function getFontAwesome7EditorConfig(): FontAwesome7EditorConfig | null {
	const config = window.elementorCommon?.config?.atomic?.fontAwesome7;

	if ( ! config || ! Array.isArray( config.jsonFiles ) || typeof config.jsonBaseUrl !== 'string' || config.jsonBaseUrl === '' ) {
		return null;
	}

	return {
		jsonFiles: config.jsonFiles,
		jsonBaseUrl: config.jsonBaseUrl,
	};
}

async function fetchFontAwesomeIcons(
	jsonFileName: string,
	signal?: AbortSignal
): Promise< Record< string, FontAwesomeIconJson > | null > {
	const cached = fontAwesomeJsonCache.get( jsonFileName );

	if ( cached ) {
		return cached;
	}

	const icons = await loadFontAwesomeIcons( jsonFileName, signal );

	if ( icons ) {
		fontAwesomeJsonCache.set( jsonFileName, icons );
	}

	return icons;
}

async function loadFontAwesomeIcons(
	jsonFileName: string,
	signal?: AbortSignal
): Promise< Record< string, FontAwesomeIconJson > | null > {
	const config = getFontAwesome7EditorConfig();

	if ( ! config?.jsonFiles.includes( jsonFileName ) ) {
		return null;
	}

	try {
		const response = await fetch( `${ config.jsonBaseUrl }${ jsonFileName }.json`, {
			signal,
		} );

		if ( ! response.ok ) {
			return null;
		}

		const data = ( await response.json() ) as { icons?: Record< string, FontAwesomeIconJson > };
		const icons = data.icons;

		if ( ! icons || typeof icons !== 'object' ) {
			return null;
		}

		return indexFontAwesomeIcons( icons );
	} catch {
		return null;
	}
}

function indexFontAwesomeIcons( icons: Record< string, FontAwesomeIconJson > ): Record< string, FontAwesomeIconJson > {
	const index: Record< string, FontAwesomeIconJson > = {};

	for ( const [ name, iconData ] of Object.entries( icons ) ) {
		if ( ! isValidIconTuple( iconData ) ) {
			continue;
		}

		index[ name ] = iconData;

		for ( const alias of iconData[ FONT_AWESOME_JSON.aliases ] ) {
			if ( typeof alias === 'string' && alias !== '' && ! index[ alias ] ) {
				index[ alias ] = iconData;
			}
		}
	}

	return index;
}

function isValidIconTuple( iconData: unknown ): iconData is FontAwesomeIconJson {
	return (
		Array.isArray( iconData ) &&
		iconData.length >= 5 &&
		typeof iconData[ FONT_AWESOME_JSON.width ] === 'number' &&
		typeof iconData[ FONT_AWESOME_JSON.height ] === 'number' &&
		Array.isArray( iconData[ FONT_AWESOME_JSON.aliases ] )
	);
}

function buildFontAwesomeSvg( iconData: FontAwesomeIconJson ): string | null {
	const width = iconData[ FONT_AWESOME_JSON.width ];
	const height = iconData[ FONT_AWESOME_JSON.height ];
	const paths = normalizePaths( iconData[ FONT_AWESOME_JSON.path ] );

	if ( paths.length === 0 ) {
		return null;
	}

	const pathMarkup = paths.map( ( path ) => `<path d="${ escapeSvgPath( path ) }"></path>` ).join( '' );

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ width } ${ height }">${ pathMarkup }</svg>`;
}

function normalizePaths( pathData: string | string[] ): string[] {
	if ( typeof pathData === 'string' && pathData !== '' ) {
		return [ pathData ];
	}

	if ( ! Array.isArray( pathData ) ) {
		return [];
	}

	return pathData.filter( ( path ): path is string => typeof path === 'string' && path !== '' );
}

function escapeSvgPath( path: string ): string {
	return path.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function processIconSvgContent( svgText: string ): string | null {
	const html = processSvgContent( svgText );

	if ( ! html ) {
		return null;
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString( html, 'image/svg+xml' );
	const svgElement = doc.querySelector( 'svg' );

	if ( ! svgElement ) {
		return null;
	}

	svgElement.setAttribute( 'aria-hidden', 'true' );
	svgElement.style.setProperty( 'width', '100%' );
	svgElement.style.setProperty( 'height', '100%' );
	svgElement.style.setProperty( 'overflow', 'visible' );

	return svgElement.outerHTML;
}

export function resetFontAwesomeIconsCache() {
	fontAwesomeJsonCache.clear();
}
