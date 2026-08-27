import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';
import { processSvgContent } from './process-svg-content';

type IconValue = {
	value?: unknown;
	library?: unknown;
};

type FontAwesomeIconJson = [ number, number, unknown, unknown, string | string[] ];

const FONT_AWESOME_JSON = {
	width: 0,
	height: 1,
	aliases: 2,
	path: 4,
} as const;

const FONT_AWESOME_7_JSON_BASE_PATH = 'lib/font-awesome-7/json/';
const ICON_SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: visible;';

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
	const iconData = findFontAwesomeIconData( icons, iconName );

	if ( ! iconData ) {
		return { html: null, url: null };
	}

	const svgText = buildFontAwesomeSvg( iconData );
	const html = processIconSvgContent( svgText );

	return { html, url: null };
} );

function getFontAwesomeIconName( iconValue: string ): string | null {
	const match = iconValue.match( /^fa\S*\s+fa-(.+)$/ );

	return match?.[ 1 ] ?? null;
}

function getFontAwesomeJsonFileName( library: string ): string | null {
	if ( ! library.startsWith( 'fa-' ) ) {
		return null;
	}

	return library.replace( /^fa-/, '' );
}

function getAssetsBaseUrl(): string | null {
	const assetsUrl = window.elementorCommon?.config?.urls?.assets;

	return typeof assetsUrl === 'string' && assetsUrl !== '' ? assetsUrl : null;
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
	const assetsUrl = getAssetsBaseUrl();

	if ( ! assetsUrl ) {
		return null;
	}

	try {
		const response = await fetch( `${ assetsUrl }${ FONT_AWESOME_7_JSON_BASE_PATH }${ jsonFileName }.json`, { signal } );

		if ( ! response.ok ) {
			return null;
		}

		const data = ( await response.json() ) as { icons?: Record< string, FontAwesomeIconJson > };

		return data.icons ?? null;
	} catch {
		return null;
	}
}

function findFontAwesomeIconData(
	icons: Record< string, FontAwesomeIconJson > | null,
	iconName: string
): FontAwesomeIconJson | null {
	if ( ! icons ) {
		return null;
	}

	if ( icons[ iconName ] ) {
		return icons[ iconName ];
	}

	for ( const iconData of Object.values( icons ) ) {
		const aliases = iconData[ FONT_AWESOME_JSON.aliases ];

		if ( ! Array.isArray( aliases ) ) {
			continue;
		}

		for ( const alias of aliases ) {
			if ( typeof alias === 'string' && alias === iconName ) {
				return iconData;
			}
		}
	}

	return null;
}

function buildFontAwesomeSvg( iconData: FontAwesomeIconJson ): string {
	const width = iconData[ FONT_AWESOME_JSON.width ];
	const height = iconData[ FONT_AWESOME_JSON.height ];
	const paths = normalizePaths( iconData[ FONT_AWESOME_JSON.path ] );
	const pathMarkup = paths
		.map( ( path ) => `<path d="${ escapeSvgPath( path ) }"></path>` )
		.join( '' );

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ width } ${ height }" aria-hidden="true">${ pathMarkup }</svg>`;
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
	return path.replace( /"/g, '&quot;' );
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

	const existingStyle = svgElement.getAttribute( 'style' ) ?? '';
	const trimmed = existingStyle.trim();
	const merged = trimmed
		? `${ trimmed.replace( /;$/, '' ) }; ${ ICON_SVG_INLINE_STYLES }`
		: ICON_SVG_INLINE_STYLES;

	svgElement.setAttribute( 'style', merged.replace( /overflow:\s*unset/g, 'overflow: visible' ) );

	return svgElement.outerHTML;
}

export function resetFontAwesomeIconsCache() {
	fontAwesomeJsonCache.clear();
}
