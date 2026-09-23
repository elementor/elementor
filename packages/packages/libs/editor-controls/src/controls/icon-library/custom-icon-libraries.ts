import { enqueueIconFonts } from '../open-icon-library';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';

const NATIVE_TAB_NAMES = new Set(['all', 'recommended', 'GoPro']);
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

export function resetCustomIconLibrariesCache() {}

export function isDeletedCustomIconLibrary( library: string, iconValue: string ): boolean {
	if ( ! library || ! iconValue.includes( library ) ) {
		return false;
	}

	if ( NATIVE_TAB_NAMES.has( library ) || library.startsWith( 'fa-' ) ) {
		return false;
	}

	return ! getIconManagerLibraries().some( ( item ) => {
		if ( ! item || typeof item !== 'object' ) return false;
		const name = ( item as { name?: unknown } ).name;
		return typeof name === 'string' && name === library;
	} );
}

export function getCustomIconLibraryConfigs(): CustomIconLibraryConfig[] {
	const libraries = getIconManagerLibraries();

	return libraries.filter(isCustomIconLibraryConfig);
}

export async function loadCustomIconLibraries(signal?: AbortSignal): Promise<FontAwesome7Icon[]> {
	const libraries = getCustomIconLibraryConfigs();
	const catalogs = await Promise.all(libraries.map((library) => loadCustomLibrary(library, signal)));

	return catalogs.flat();
}

export async function resolveCustomIcon(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise<FontAwesome7Icon | null> {
	const icons = await loadCustomIconLibraries(signal);
	const icon = icons.find(
		(item) => item.library === library && (item.value === iconValue || item.id === `${library}:${iconValue}`)
	);

	if (!icon) {
		return null;
	}

	if (icon.paths.length > 0 || icon.svgMarkup) {
		return icon;
	}

	const config = getCustomIconLibraryConfigs().find((item) => item.name === library);

	if (!config?.fetchJson) {
		return icon;
	}

	const svgMarkup = await fetchSiblingSvg(config.fetchJson, icon.name, signal);

	if (!svgMarkup) {
		return icon;
	}

	return {
		...icon,
		svgMarkup,
	};
}

async function loadCustomLibrary(library: CustomIconLibraryConfig, signal?: AbortSignal): Promise<FontAwesome7Icon[]> {
	enqueueIconFonts(library.name);

	const payload = await loadLibraryPayload(library, signal);
	const parsedIcons = parseCustomIcons(payload);

	return parsedIcons.map((icon) => toCatalogIcon(library, icon));
}

async function loadLibraryPayload(library: CustomIconLibraryConfig, signal?: AbortSignal): Promise<unknown> {
	if (library.icons !== undefined) {
		return { icons: library.icons };
	}

	if (!library.fetchJson) {
		return null;
	}

	try {
		const response = await fetch(library.fetchJson, { signal, mode: 'cors' });

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch {
		return null;
	}
}

function parseCustomIcons(payload: unknown): ParsedCustomIcon[] {
	if (!payload || typeof payload !== 'object') {
		return [];
	}

	const icons = (payload as { icons?: unknown }).icons;

	if (Array.isArray(icons)) {
		return icons.flatMap(parseIconEntry).filter((icon) => icon.name !== '');
	}

	if (icons && typeof icons === 'object') {
		return Object.entries(icons)
			.flatMap(([name, value]) => parseNamedIcon(name, value))
			.filter((icon) => icon.name !== '');
	}

	return [];
}

function parseIconEntry(entry: unknown): ParsedCustomIcon[] {
	if (typeof entry === 'string') {
		return [createParsedIcon(entry)];
	}

	if (!entry || typeof entry !== 'object') {
		return [];
	}

	if ('name' in entry && typeof (entry as { name: unknown }).name === 'string') {
		return [parseNamedIcon((entry as { name: string }).name, entry)[0] ?? createParsedIcon('')];
	}

	const [name, value] = Object.entries(entry)[0] ?? [];

	if (typeof name !== 'string') {
		return [];
	}

	return parseNamedIcon(name, value);
}

function parseNamedIcon(name: string, value: unknown): ParsedCustomIcon[] {
	const parsed = createParsedIcon(name);

	if (typeof value === 'string' && looksLikeSvg(value)) {
		parsed.svgMarkup = value;
		return [parsed];
	}

	if (!value || typeof value !== 'object') {
		return [parsed];
	}

	const record = value as Record<string, unknown>;

	if (typeof record.svg === 'string' && looksLikeSvg(record.svg)) {
		parsed.svgMarkup = record.svg;
	}

	if (Array.isArray(record.paths)) {
		parsed.paths = record.paths.filter((path): path is string => typeof path === 'string' && path !== '');
	} else if (typeof record.path === 'string' && record.path !== '') {
		parsed.paths = [record.path];
	}

	if (typeof record.width === 'number') {
		parsed.width = record.width;
	}

	if (typeof record.height === 'number') {
		parsed.height = record.height;
	}

	if (Array.isArray(record.aliases)) {
		parsed.aliases = record.aliases.filter((alias): alias is string => typeof alias === 'string');
	}

	return [parsed];
}

function createParsedIcon(name: string): ParsedCustomIcon {
	return {
		name: name.trim().replace(/^:/, '').replace(/:$/, ''),
		aliases: [],
		width: DEFAULT_ICON_SIZE,
		height: DEFAULT_ICON_SIZE,
		paths: [],
	};
}

function toCatalogIcon(library: CustomIconLibraryConfig, icon: ParsedCustomIcon): FontAwesome7Icon {
	const value = createCustomIconSelectionValue(library, icon.name);

	return {
		id: `${library.name}:${icon.name}`,
		name: icon.name,
		label: icon.name.replace(/-/g, ' '),
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

export function createCustomIconSelectionValue(library: CustomIconLibraryConfig, name: string): string {
	const prefix = library.prefix;
	const displayPrefix = library.displayPrefix || prefix.replace(/-$/, '');

	return `${displayPrefix} ${prefix}${name}`.trim();
}

function looksLikeSvg(value: string): boolean {
	return value.includes('<svg');
}

function getIconManagerLibraries(): unknown[] {
	const config = window.elementor?.config as { icons?: { libraries?: unknown } } | undefined;

	return Array.isArray(config?.icons?.libraries) ? config.icons.libraries : [];
}

function isCustomIconLibraryConfig(value: unknown): value is CustomIconLibraryConfig {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const library = value as Partial<CustomIconLibraryConfig> & { name?: unknown };

	if (typeof library.name !== 'string' || library.name === '' || NATIVE_TAB_NAMES.has(library.name)) {
		return false;
	}

	if (library.native === true || library.name.startsWith('fa-')) {
		return false;
	}

	if (typeof library.prefix !== 'string') {
		return false;
	}

	return Boolean(library.fetchJson) || library.icons !== undefined;
}

async function fetchSiblingSvg(fetchJson: string, iconName: string, signal?: AbortSignal): Promise<string | null> {
	const candidates = getSiblingSvgUrls(fetchJson, iconName);

	for (const url of candidates) {
		const markup = await fetchSvgMarkup(url, signal);

		if (markup) {
			return markup;
		}
	}

	return null;
}

function getSiblingSvgUrls(fetchJson: string, iconName: string): string[] {
	try {
		const jsonUrl = new URL(fetchJson);
		const directory = jsonUrl.href.slice(0, jsonUrl.href.lastIndexOf('/') + 1);
		const encodedName = encodeURIComponent(iconName);

		return [`${directory}${encodedName}.svg`, `${directory}svg/${encodedName}.svg`];
	} catch {
		return [];
	}
}

async function fetchSvgMarkup(url: string, signal?: AbortSignal): Promise<string | null> {
	const controller = new AbortController();
	const timeoutId = window.setTimeout(() => controller.abort(), CUSTOM_SVG_FETCH_TIMEOUT_MS);
	const abortFromParent = () => controller.abort();

	signal?.addEventListener('abort', abortFromParent, { once: true });

	try {
		const response = await fetch(url, { signal: controller.signal, mode: 'cors' });

		if (!response.ok) {
			return null;
		}

		const markup = await response.text();

		return looksLikeSvg(markup) ? markup : null;
	} catch {
		return null;
	} finally {
		window.clearTimeout(timeoutId);
		signal?.removeEventListener('abort', abortFromParent);
	}
}
