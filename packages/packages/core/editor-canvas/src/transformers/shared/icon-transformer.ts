import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';
import { processSvgContent } from './process-svg-content';

type IconValue = {
	value?: unknown;
	library?: unknown;
};

type FontAwesomeIconJson = [ number, number, unknown, unknown, string ];

const FONT_AWESOME_JSON = {
	width: 0,
	height: 1,
	path: 4,
} as const;

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
	const html = processSvgContent( svgText );

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
		const response = await fetch( `${ assetsUrl }lib/font-awesome/json/${ jsonFileName }.json`, { signal } );

		if ( ! response.ok ) {
			return null;
		}

		const data = ( await response.json() ) as { icons?: Record< string, FontAwesomeIconJson > };

		return data.icons ?? null;
	} catch {
		return null;
	}
}

function buildFontAwesomeSvg( iconData: FontAwesomeIconJson ): string {
	const width = iconData[ FONT_AWESOME_JSON.width ];
	const height = iconData[ FONT_AWESOME_JSON.height ];
	const path = iconData[ FONT_AWESOME_JSON.path ];

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ width } ${ height }"><path d="${ path }"></path></svg>`;
}

export function resetFontAwesomeIconsCache() {
	fontAwesomeJsonCache.clear();
}
