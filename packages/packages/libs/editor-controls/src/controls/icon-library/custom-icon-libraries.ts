import { type HttpResponse, httpService } from '@elementor/http-client';
import { useQuery } from '@elementor/query';

import { enqueueIconFonts } from '../open-icon-library';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { fontelloSvgUrlFromConfig, parseFontelloSvgFont } from './fontello-svg-font';

const NATIVE_TAB_NAMES = new Set( [ 'all', 'recommended', 'GoPro' ] );
const DEFAULT_ICON_SIZE = 512;
const CUSTOM_ICON_LIBRARIES_QUERY_KEY = [ 'custom-icon-libraries' ];
const CUSTOM_ICON_SVG_URL = 'elementor/v1/atomic-widgets/custom-icon-svg';

type CustomIconLibraryConfig = {
	name: string;
	prefix: string;
	displayPrefix?: string;
	fetchJson?: string;
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
		const { data } = await httpService().get< HttpResponse< { icons?: Record< string, string > } > >(
			CUSTOM_ICON_SVG_URL,
			{ params: { library: String( library ) }, signal }
		);
		const icons = data.data?.icons && typeof data.data.icons === 'object' ? data.data.icons : {};

		return icons;
	} catch {
		return {};
	}
}

async function loadSvgMapFromFontelloPack(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< Record< string, string > > {
	if ( ! library.fetchJson ) {
		return {};
	}

	const fontUrl = fontelloSvgUrlFromConfig( library.fetchJson );

	if ( ! fontUrl ) {
		return {};
	}

	try {
		const [ configResponse, fontResponse ] = await Promise.all( [
			fetch( library.fetchJson, { signal, mode: 'cors' } ),
			fetch( fontUrl, { signal, mode: 'cors' } ),
		] );

		if ( ! configResponse.ok || ! fontResponse.ok ) {
			return {};
		}

		const configJson = await configResponse.text();
		const svgFont = await fontResponse.text();
		const names = parseIconNames( JSON.parse( configJson ) );
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

				return [];
			} )
			.filter( Boolean );
	}

	if ( icons && typeof icons === 'object' ) {
		return Object.keys( icons ).map( normalizeIconName ).filter( Boolean );
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
