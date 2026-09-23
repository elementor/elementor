import { type HttpResponse, httpService } from '@elementor/http-client';
import { useQuery } from '@elementor/query';

import { enqueueIconFonts } from '../open-icon-library';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';

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
	if ( ! library || ! iconValue.includes( library ) ) {
		return false;
	}

	if ( NATIVE_TAB_NAMES.has( library ) || library.startsWith( 'fa-' ) ) {
		return false;
	}

	return ! getCustomIconLibraryConfigs().some( ( item ) => item.name === library );
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
	const map = await loadLibrarySvgMap( library, signal );
	const markup = map[ iconValue ];

	return typeof markup === 'string' && markup !== '' ? markup : null;
}

function getCustomIconLibraryConfigs(): CustomIconLibraryConfig[] {
	const libraries = window.elementor?.config as { icons?: { libraries?: unknown } } | undefined;
	const items = Array.isArray( libraries?.icons?.libraries ) ? libraries.icons.libraries : [];

	return items.filter( isCustomIconLibraryConfig );
}

function isCustomIconLibraryConfig( value: unknown ): value is CustomIconLibraryConfig {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}

	const library = value as CustomIconLibraryConfig;

	if ( typeof library.name !== 'string' || library.name === '' || NATIVE_TAB_NAMES.has( library.name ) ) {
		return false;
	}

	if ( library.native === true || library.name.startsWith( 'fa-' ) || typeof library.prefix !== 'string' ) {
		return false;
	}

	return Boolean( library.fetchJson ) || library.icons !== undefined;
}

async function loadCustomLibrary(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< FontAwesome7Icon[] > {
	enqueueIconFonts( library.name );

	const names = parseIconNames( await loadLibraryPayload( library, signal ) );
	const svgMap = await loadLibrarySvgMap( library.name, signal );

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

async function loadLibrarySvgMap( library: string, signal?: AbortSignal ): Promise< Record< string, string > > {
	const cached = svgMapCache.get( library );

	if ( cached ) {
		return cached;
	}

	try {
		const { data } = await httpService().get< HttpResponse< { icons?: Record< string, string > } > >(
			CUSTOM_ICON_SVG_URL,
			{ params: { library }, signal }
		);
		const icons = data.data?.icons && typeof data.data.icons === 'object' ? data.data.icons : {};
		svgMapCache.set( library, icons );

		return icons;
	} catch {
		svgMapCache.set( library, {} );

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
