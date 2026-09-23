import { type HttpResponse, httpService } from '@elementor/http-client';
import { useQuery } from '@elementor/query';

import { enqueueIconFonts } from '../open-icon-library';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { fontelloSvgUrlFromConfig, parseFontelloSvgFont } from './fontello-svg-font';
import { parseIcomoonSelection } from './icomoon-selection';

const NATIVE_TAB_NAMES = new Set( [ 'all', 'recommended', 'GoPro' ] );
const DEFAULT_ICON_SIZE = 512;
const CUSTOM_ICON_LIBRARIES_QUERY_KEY = [ 'custom-icon-libraries' ];
const CUSTOM_ICON_SVG_URL = 'elementor/v1/atomic-widgets/custom-icon-svg';

type CustomIconLibraryConfig = {
	name: string;
	prefix: string;
	displayPrefix?: string;
	fetchJson?: string;
	configUrl?: string;
	fontUrl?: string;
	selectionUrl?: string;
	icons?: unknown;
	native?: boolean;
};

const svgMapCache = new Map< string, Record< string, string > >();

export function resetCustomIconSvgCache() {
	svgMapCache.clear();
}

export function isDeletedCustomIconLibrary( library: string, iconValue: string ): boolean {
	const libraryName = String( library );

	if ( ! libraryName || ! iconValue.includes( libraryName ) ) {
		return false;
	}

	if ( NATIVE_TAB_NAMES.has( libraryName ) || libraryName.startsWith( 'fa-' ) ) {
		return false;
	}

	return ! getCustomIconLibraryConfigs().some( ( item ) => item.name === libraryName );
}

export function useCustomIconLibraries( enabled: boolean ) {
	return useQuery< FontAwesome7Icon[] >( {
		queryKey: CUSTOM_ICON_LIBRARIES_QUERY_KEY,
		queryFn: ( { signal } ) => loadCustomIconLibraries( signal ),
		enabled,
		staleTime: Infinity,
	} );
}

export async function loadCustomIconLibraries( signal?: AbortSignal ): Promise< FontAwesome7Icon[] > {
	const catalogs = await Promise.all(
		getCustomIconLibraryConfigs().map( ( library ) => loadCustomLibrary( library, signal ) )
	);

	return catalogs.flat();
}

export async function resolveCustomIconSvg(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< string | null > {
	const config = getCustomIconLibraryConfigs().find( ( item ) => item.name === String( library ) );
	const map = await loadLibrarySvgMap( String( library ), config, signal );
	const markup = map[ iconValue ];

	return typeof markup === 'string' && markup !== '' ? markup : null;
}

function getCustomIconLibraryConfigs(): CustomIconLibraryConfig[] {
	const libraries = window.elementor?.config as { icons?: { libraries?: unknown } } | undefined;
	const items = Array.isArray( libraries?.icons?.libraries ) ? libraries.icons.libraries : [];

	return items.flatMap( ( value ) => {
		const library = normalizeCustomIconLibraryConfig( value );

		return library ? [ library ] : [];
	} );
}

function normalizeCustomIconLibraryConfig( value: unknown ): CustomIconLibraryConfig | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const library = value as CustomIconLibraryConfig & { name?: unknown; prefix?: unknown };
	const name = coerceLibraryName( library.name );

	if ( name === '' || NATIVE_TAB_NAMES.has( name ) || library.native === true || name.startsWith( 'fa-' ) ) {
		return null;
	}

	if ( typeof library.prefix !== 'string' ) {
		return null;
	}

	if ( ! library.fetchJson && library.icons === undefined ) {
		return null;
	}

	return {
		...library,
		name,
		prefix: library.prefix,
		...getPackUrls( name ),
	};
}

function coerceLibraryName( value: unknown ): string {
	if ( typeof value === 'string' ) {
		return value;
	}

	if ( typeof value === 'number' && Number.isFinite( value ) ) {
		return String( value );
	}

	return '';
}

function getPackUrls( library: string ): { configUrl?: string; fontUrl?: string } {
	const packs = window.elementorCommon?.config?.fontAwesome?.v7?.customIconPacks;

	if ( ! packs || typeof packs !== 'object' ) {
		return {};
	}

	const pack = packs[ library ];

	if ( ! pack || typeof pack !== 'object' ) {
		return {};
	}

	return {
		configUrl: typeof pack.configUrl === 'string' ? pack.configUrl : undefined,
		fontUrl: typeof pack.fontUrl === 'string' ? pack.fontUrl : undefined,
		selectionUrl: typeof pack.selectionUrl === 'string' ? pack.selectionUrl : undefined,
	};
}

async function loadCustomLibrary(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< FontAwesome7Icon[] > {
	enqueueIconFonts( library.name );

	const names = parseIconNames( await loadLibraryPayload( library, signal ) );
	const svgMap = await loadLibrarySvgMap( library.name, library, signal );

	return names.map( ( name ) => {
		const value = createCustomIconSelectionValue( library, name );

		return {
			id: `${ library.name }:${ name }`,
			name,
			label: name.replace( /-/g, ' ' ),
			library: library.name,
			value,
			aliases: [],
			width: DEFAULT_ICON_SIZE,
			height: DEFAULT_ICON_SIZE,
			paths: [],
			glyphClass: value,
			svgMarkup: svgMap[ value ],
		};
	} );
}

async function loadLibrarySvgMap(
	library: string,
	config?: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< Record< string, string > > {
	const cached = svgMapCache.get( library );

	if ( cached && Object.keys( cached ).length > 0 ) {
		return cached;
	}

	const fromRest = await loadSvgMapFromRest( library, signal );

	if ( Object.keys( fromRest ).length > 0 ) {
		svgMapCache.set( library, fromRest );

		return fromRest;
	}

	const fromFont = config ? await loadSvgMapFromFontelloPack( config, signal ) : {};

	if ( Object.keys( fromFont ).length > 0 ) {
		svgMapCache.set( library, fromFont );

		return fromFont;
	}

	return {};
}

async function loadSvgMapFromRest( library: string, signal?: AbortSignal ): Promise< Record< string, string > > {
	try {
		const response = await httpService().get< HttpResponse< { icons?: Record< string, string > } > >(
			CUSTOM_ICON_SVG_URL,
			{ params: { library: String( library ) }, signal }
		);

		return unwrapIconMap( response );
	} catch {
		return {};
	}
}

function unwrapIconMap( payload: unknown ): Record< string, string > {
	let current: unknown = payload;

	for ( let depth = 0; depth < 4; depth++ ) {
		if ( ! current || typeof current !== 'object' ) {
			return {};
		}

		const record = current as Record< string, unknown >;

		if ( record.icons && typeof record.icons === 'object' && ! Array.isArray( record.icons ) ) {
			return record.icons as Record< string, string >;
		}

		current = 'data' in record ? record.data : undefined;
	}

	return {};
}

async function loadSvgMapFromFontelloPack(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< Record< string, string > > {
	if ( library.selectionUrl ) {
		try {
			const response = await fetch( library.selectionUrl, { signal, mode: 'cors' } );

			if ( response.ok ) {
				const selectionJson = await response.text();
				const names = parseIconNames( safeJson( selectionJson ) );
				const payloadNames = names.length > 0 ? names : parseIconNames( { icons: library.icons } );

				return parseIcomoonSelection(
					selectionJson,
					library.prefix,
					library.displayPrefix ?? '',
					payloadNames
				);
			}
		} catch {
			return {};
		}
	}

	const configUrl = library.configUrl ?? library.fetchJson;
	const fontUrl = library.fontUrl ?? ( library.fetchJson ? fontelloSvgUrlFromConfig( library.fetchJson ) : null );

	if ( ! configUrl || ! fontUrl ) {
		return {};
	}

	try {
		const [ configResponse, fontResponse ] = await Promise.all( [
			fetch( configUrl, { signal, mode: 'cors' } ),
			fetch( fontUrl, { signal, mode: 'cors' } ),
		] );

		if ( ! configResponse.ok || ! fontResponse.ok ) {
			return {};
		}

		const configJson = await configResponse.text();
		const svgFont = await fontResponse.text();
		const names = parseIconNames( safeJson( configJson ) );
		const payloadNames = names.length > 0 ? names : parseIconNames( { icons: library.icons } );

		return parseFontelloSvgFont(
			configJson,
			svgFont,
			library.prefix,
			library.displayPrefix ?? '',
			payloadNames
		);
	} catch {
		return {};
	}
}

function safeJson( value: string ): unknown {
	try {
		return JSON.parse( value );
	} catch {
		return null;
	}
}

async function loadLibraryPayload( library: CustomIconLibraryConfig, signal?: AbortSignal ): Promise< unknown > {
	if ( library.icons !== undefined ) {
		return { icons: library.icons };
	}

	if ( ! library.fetchJson ) {
		return null;
	}

	try {
		const response = await fetch( library.fetchJson, { signal, mode: 'cors' } );

		return response.ok ? response.json() : null;
	} catch {
		return null;
	}
}

function parseIconNames( payload: unknown ): string[] {
	if ( ! payload || typeof payload !== 'object' ) {
		return [];
	}

	const icons = ( payload as { icons?: unknown } ).icons;

	if ( Array.isArray( icons ) ) {
		return icons
			.flatMap( ( entry ) => {
				if ( typeof entry === 'string' ) {
					return [ normalizeIconName( entry ) ];
				}

				if ( entry && typeof entry === 'object' && 'name' in entry && typeof entry.name === 'string' ) {
					return [ normalizeIconName( entry.name ) ];
				}

				if (
					entry &&
					typeof entry === 'object' &&
					'properties' in entry &&
					entry.properties &&
					typeof entry.properties === 'object' &&
					'name' in entry.properties &&
					typeof entry.properties.name === 'string'
				) {
					return [ normalizeIconName( entry.properties.name ) ];
				}

				return [];
			} )
			.filter( Boolean );
	}

	if ( icons && typeof icons === 'object' ) {
		return Object.keys( icons ).map( normalizeIconName ).filter( Boolean );
	}

	const glyphs = ( payload as { glyphs?: unknown } ).glyphs;

	if ( Array.isArray( glyphs ) ) {
		return glyphs
			.flatMap( ( entry ) => {
				if ( entry && typeof entry === 'object' && 'css' in entry && typeof entry.css === 'string' ) {
					return [ normalizeIconName( entry.css ) ];
				}

				return [];
			} )
			.filter( Boolean );
	}

	return [];
}

function normalizeIconName( name: string ): string {
	return name.trim().replace( /^:/, '' ).replace( /:$/, '' );
}

function createCustomIconSelectionValue( library: CustomIconLibraryConfig, name: string ): string {
	const prefix = library.prefix;
	const displayPrefix = library.displayPrefix || prefix.replace( /-$/, '' );

	return `${ displayPrefix } ${ prefix }${ name }`.trim();
}
