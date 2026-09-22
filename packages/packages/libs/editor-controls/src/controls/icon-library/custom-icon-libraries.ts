import { enqueueIconFonts } from '../open-icon-library';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { sanitizeSvgMarkup } from './sanitize-svg-markup';

const NATIVE_TAB_NAMES = new Set( [ 'all', 'recommended', 'GoPro' ] );
const DEFAULT_ICON_SIZE = 512;
const CUSTOM_SVG_FETCH_TIMEOUT_MS = 4000;

export type CustomIconLibraryConfig = {
	name: string;
	label: string;
	prefix: string;
	displayPrefix: string;
	fetchJson?: string;
	url?: string;
	enqueue?: string[];
	native?: boolean;
	icons?: unknown;
	ver?: string;
};

type ParsedCustomIcon = {
	name: string;
	aliases: string[];
	width: number;
	height: number;
	paths: string[];
	svgMarkup?: string;
};

const libraryCache = new Map< string, FontAwesome7Icon[] >();
const libraryInFlight = new Map< string, Promise< FontAwesome7Icon[] > >();
const siblingSvgCache = new Map< string, string | null >();

export function getCustomIconLibraryConfigs(): CustomIconLibraryConfig[] {
	const libraries = getIconManagerLibraries();

	return libraries.filter( isCustomIconLibraryConfig );
}

export function resetCustomIconLibrariesCache() {
	libraryCache.clear();
	libraryInFlight.clear();
	siblingSvgCache.clear();
}

export async function loadCustomIconLibraries( signal?: AbortSignal ): Promise< FontAwesome7Icon[] > {
	const libraries = getCustomIconLibraryConfigs();
	const catalogs = await Promise.all( libraries.map( ( library ) => getCachedLibrary( library, signal ) ) );

	return catalogs.flat();
}

export function isDeletedCustomIconLibrary( library: string, iconValue: string ): boolean {
	if ( ! library || ! iconValue.includes( library ) ) {
		return false;
	}

	if ( NATIVE_TAB_NAMES.has( library ) || library.startsWith( 'fa-' ) ) {
		return false;
	}

	return ! getIconManagerLibraries().some( ( item ) => getLibraryName( item ) === library );
}

function getLibraryName( value: unknown ): string | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const name = ( value as { name?: unknown } ).name;

	return typeof name === 'string' && name !== '' ? name : null;
}

export async function resolveCustomIcon(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< FontAwesome7Icon | null > {
	const config = getCustomIconLibraryConfigs().find( ( item ) => item.name === library );

	if ( ! config ) {
		return null;
	}

	const icons = await getCachedLibrary( config, signal );
	const icon = icons.find( ( item ) => isMatchingCustomIcon( item, config, iconValue ) );

	if ( ! icon ) {
		return null;
	}

	if ( icon.paths.length > 0 || icon.svgMarkup ) {
		return icon;
	}

	if ( ! config.fetchJson ) {
		return icon;
	}

	const svgMarkup = await getCachedSiblingSvg( config, icon.name, signal );

	if ( ! svgMarkup ) {
		return icon;
	}

	return {
		...icon,
		svgMarkup,
	};
}

function isMatchingCustomIcon(
	icon: FontAwesome7Icon,
	library: CustomIconLibraryConfig,
	iconValue: string
): boolean {
	if ( icon.library !== library.name ) {
		return false;
	}

	if ( icon.value === iconValue || icon.glyphClass === iconValue || icon.id === `${ library.name }:${ iconValue }` ) {
		return true;
	}

	return getIconNameCandidates( library, iconValue ).includes( icon.name );
}

async function getCachedLibrary(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< FontAwesome7Icon[] > {
	enqueueIconFonts( library.name );

	const cached = libraryCache.get( library.name );

	if ( cached ) {
		return cached;
	}

	const inFlight = libraryInFlight.get( library.name );

	if ( inFlight ) {
		return inFlight;
	}

	const request = loadCustomLibrary( library, signal ).then( ( icons ) => {
		libraryCache.set( library.name, icons );

		return icons;
	} );

	libraryInFlight.set( library.name, request );

	try {
		return await request;
	} finally {
		libraryInFlight.delete( library.name );
	}
}

async function loadCustomLibrary(
	library: CustomIconLibraryConfig,
	signal?: AbortSignal
): Promise< FontAwesome7Icon[] > {
	const payload = await loadLibraryPayload( library, signal );
	const parsedIcons = parseCustomIcons( payload );
	const catalog = parsedIcons.map( ( icon ) => toCatalogIcon( library, icon ) );

	return Promise.all( catalog.map( ( icon ) => hydrateCatalogIcon( library, icon, signal ) ) );
}

async function hydrateCatalogIcon(
	library: CustomIconLibraryConfig,
	icon: FontAwesome7Icon,
	signal?: AbortSignal
): Promise< FontAwesome7Icon > {
	if ( icon.paths.length > 0 || icon.svgMarkup || ! library.fetchJson ) {
		return icon;
	}

	const svgMarkup = await getCachedSiblingSvg( library, icon.name, signal );

	return svgMarkup ? { ...icon, svgMarkup } : icon;
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

		if ( ! response.ok ) {
			return null;
		}

		return response.json();
	} catch {
		return null;
	}
}

function parseCustomIcons( payload: unknown ): ParsedCustomIcon[] {
	if ( ! payload || typeof payload !== 'object' ) {
		return [];
	}

	const icons = ( payload as { icons?: unknown } ).icons;

	if ( Array.isArray( icons ) ) {
		return icons.flatMap( parseIconEntry ).filter( ( icon ) => icon.name !== '' );
	}

	if ( icons && typeof icons === 'object' ) {
		return Object.entries( icons )
			.flatMap( ( [ name, value ] ) => parseNamedIcon( name, value ) )
			.filter( ( icon ) => icon.name !== '' );
	}

	return [];
}

function parseIconEntry( entry: unknown ): ParsedCustomIcon[] {
	if ( typeof entry === 'string' ) {
		return [ createParsedIcon( entry ) ];
	}

	if ( ! entry || typeof entry !== 'object' ) {
		return [];
	}

	if ( 'name' in entry && typeof ( entry as { name: unknown } ).name === 'string' ) {
		return [ parseNamedIcon( ( entry as { name: string } ).name, entry )[ 0 ] ?? createParsedIcon( '' ) ];
	}

	const [ name, value ] = Object.entries( entry )[ 0 ] ?? [];

	if ( typeof name !== 'string' ) {
		return [];
	}

	return parseNamedIcon( name, value );
}

function parseNamedIcon( name: string, value: unknown ): ParsedCustomIcon[] {
	const parsed = createParsedIcon( name );

	if ( typeof value === 'string' ) {
		parsed.svgMarkup = sanitizeSvgMarkup( value ) ?? undefined;
		return [ parsed ];
	}

	if ( ! value || typeof value !== 'object' ) {
		return [ parsed ];
	}

	const record = value as Record< string, unknown >;

	if ( typeof record.svg === 'string' ) {
		parsed.svgMarkup = sanitizeSvgMarkup( record.svg ) ?? undefined;
	}

	if ( Array.isArray( record.paths ) ) {
		parsed.paths = record.paths.filter( ( path ): path is string => typeof path === 'string' && path !== '' );
	} else if ( typeof record.path === 'string' && record.path !== '' ) {
		parsed.paths = [ record.path ];
	}

	if ( typeof record.width === 'number' ) {
		parsed.width = record.width;
	}

	if ( typeof record.height === 'number' ) {
		parsed.height = record.height;
	}

	if ( Array.isArray( record.aliases ) ) {
		parsed.aliases = record.aliases.filter( ( alias ): alias is string => typeof alias === 'string' );
	}

	return [ parsed ];
}

function createParsedIcon( name: string ): ParsedCustomIcon {
	return {
		name: name.trim().replace( /^:/, '' ).replace( /:$/, '' ),
		aliases: [],
		width: DEFAULT_ICON_SIZE,
		height: DEFAULT_ICON_SIZE,
		paths: [],
	};
}

function toCatalogIcon( library: CustomIconLibraryConfig, icon: ParsedCustomIcon ): FontAwesome7Icon {
	const value = createCustomIconSelectionValue( library, icon.name );

	return {
		id: `${ library.name }:${ icon.name }`,
		name: icon.name,
		label: icon.name.replace( /-/g, ' ' ),
		library: library.name,
		value,
		aliases: icon.aliases,
		width: icon.width,
		height: icon.height,
		paths: icon.paths,
		glyphClass: value,
		svgMarkup: icon.svgMarkup,
	};
}

export function createCustomIconSelectionValue( library: CustomIconLibraryConfig, name: string ): string {
	const prefix = library.prefix || '';
	const displayPrefix = library.displayPrefix || prefix.replace( /-$/, '' );
	const className = prefix && name.startsWith( prefix ) ? name : `${ prefix }${ name }`;

	if ( ! displayPrefix || className.startsWith( `${ displayPrefix } ` ) ) {
		return className.trim();
	}

	return `${ displayPrefix } ${ className }`.trim();
}

function getIconNameCandidates( library: CustomIconLibraryConfig, iconValue: string ): string[] {
	const prefix = library.prefix || '';
	const displayPrefix = library.displayPrefix || prefix.replace( /-$/, '' );
	const names = new Set< string >();
	let remaining = iconValue.trim();

	names.add( remaining );

	if ( displayPrefix && remaining.startsWith( `${ displayPrefix } ` ) ) {
		remaining = remaining.slice( displayPrefix.length + 1 ).trim();
		names.add( remaining );
	}

	if ( prefix && remaining.startsWith( prefix ) ) {
		names.add( remaining.slice( prefix.length ) );
	} else if ( prefix ) {
		names.add( `${ prefix }${ remaining }` );
	}

	return [ ...names ].filter( Boolean );
}

function getIconManagerLibraries(): unknown[] {
	const config = window.elementor?.config as { icons?: { libraries?: unknown } } | undefined;

	return Array.isArray( config?.icons?.libraries ) ? config.icons.libraries : [];
}

function isCustomIconLibraryConfig( value: unknown ): value is CustomIconLibraryConfig {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}

	const library = value as Partial< CustomIconLibraryConfig > & { name?: unknown };

	if ( typeof library.name !== 'string' || library.name === '' || NATIVE_TAB_NAMES.has( library.name ) ) {
		return false;
	}

	if ( library.native === true || library.name.startsWith( 'fa-' ) ) {
		return false;
	}

	if ( typeof library.prefix !== 'string' ) {
		return false;
	}

	return Boolean( library.fetchJson ) || library.icons !== undefined;
}

async function getCachedSiblingSvg(
	library: CustomIconLibraryConfig,
	iconName: string,
	signal?: AbortSignal
): Promise< string | null > {
	if ( ! library.fetchJson ) {
		return null;
	}

	const cacheKey = `${ library.fetchJson }:${ iconName }`;
	const cached = siblingSvgCache.get( cacheKey );

	if ( cached !== undefined ) {
		return cached;
	}

	const markup = await fetchSiblingSvg( library, iconName, signal );

	siblingSvgCache.set( cacheKey, markup );

	return markup;
}

async function fetchSiblingSvg(
	library: CustomIconLibraryConfig,
	iconName: string,
	signal?: AbortSignal
): Promise< string | null > {
	if ( ! library.fetchJson ) {
		return null;
	}

	const candidates = getSiblingSvgUrls( library.fetchJson, getIconNameCandidates( library, iconName ) );

	for ( const url of candidates ) {
		const markup = await fetchSvgMarkup( url, signal );

		if ( markup ) {
			return markup;
		}
	}

	return null;
}

function getSiblingSvgUrls( fetchJson: string, iconNames: string[] ): string[] {
	try {
		const jsonUrl = new URL( fetchJson );
		const directory = jsonUrl.href.slice( 0, jsonUrl.href.lastIndexOf( '/' ) + 1 );
		const urls: string[] = [];

		iconNames.forEach( ( iconName ) => {
			const encodedName = encodeURIComponent( iconName );

			urls.push( `${ directory }${ encodedName }.svg` );
			urls.push( `${ directory }svg/${ encodedName }.svg` );
		} );

		return urls;
	} catch {
		return [];
	}
}

async function fetchSvgMarkup( url: string, signal?: AbortSignal ): Promise< string | null > {
	const controller = new AbortController();
	const timeoutId = window.setTimeout( () => controller.abort(), CUSTOM_SVG_FETCH_TIMEOUT_MS );
	const abortFromParent = () => controller.abort();

	signal?.addEventListener( 'abort', abortFromParent, { once: true } );

	try {
		const response = await fetch( url, { signal: controller.signal, mode: 'cors' } );

		if ( ! response.ok ) {
			return null;
		}

		const markup = await response.text();

		return sanitizeSvgMarkup( markup );
	} catch {
		return null;
	} finally {
		window.clearTimeout( timeoutId );
		signal?.removeEventListener( 'abort', abortFromParent );
	}
}
