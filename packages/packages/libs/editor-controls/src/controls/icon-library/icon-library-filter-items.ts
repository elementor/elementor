export const ICON_LIBRARY_FILTER_TYPE_ALL = 'all';
export const ICON_LIBRARY_FILTER_TYPE_GROUP = 'group';
export const ICON_LIBRARY_FILTER_TYPE_ITEM = 'item';

export type IconLibraryFilterEntry =
	| {
			type: typeof ICON_LIBRARY_FILTER_TYPE_ALL;
			label: string;
			icon?: string;
	  }
	| {
			type: typeof ICON_LIBRARY_FILTER_TYPE_GROUP;
			label: string;
	  }
	| {
			type: typeof ICON_LIBRARY_FILTER_TYPE_ITEM;
			value: string;
			label: string;
			icon?: string;
	  };

const DEFAULT_ICON_LIBRARY_FILTER: IconLibraryFilterEntry[] = [
	{ type: ICON_LIBRARY_FILTER_TYPE_ALL, label: 'All icons', icon: 'list' },
	{ type: ICON_LIBRARY_FILTER_TYPE_ITEM, value: 'fa-regular', label: 'Font Awesome - Regular', icon: 'star' },
	{ type: ICON_LIBRARY_FILTER_TYPE_ITEM, value: 'fa-solid', label: 'Font Awesome - Solid', icon: 'star-filled' },
	{ type: ICON_LIBRARY_FILTER_TYPE_ITEM, value: 'fa-brands', label: 'Font Awesome - Brands', icon: 'library' },
];

export function getIconLibraryFilterItems(): IconLibraryFilterEntry[] {
	const filter = window.elementorCommon?.config?.fontAwesome?.v7?.filter;

	if ( ! Array.isArray( filter ) ) {
		return DEFAULT_ICON_LIBRARY_FILTER;
	}

	const entries = filter
		.map( parseFilterEntry )
		.filter( ( entry ): entry is IconLibraryFilterEntry => entry !== null );

	return entries.length > 0 ? entries : DEFAULT_ICON_LIBRARY_FILTER;
}

export function getSelectableFilterValues( entries: IconLibraryFilterEntry[] ): string[] {
	return entries.flatMap( ( entry ) => ( entry.type === ICON_LIBRARY_FILTER_TYPE_ITEM ? [ entry.value ] : [] ) );
}

function parseFilterEntry( value: unknown ): IconLibraryFilterEntry | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const entry = value as { type?: unknown; label?: unknown; value?: unknown; icon?: unknown };

	if ( typeof entry.label !== 'string' || entry.label === '' ) {
		return null;
	}

	if ( entry.type === ICON_LIBRARY_FILTER_TYPE_GROUP ) {
		return { type: ICON_LIBRARY_FILTER_TYPE_GROUP, label: entry.label };
	}

	if ( entry.type === ICON_LIBRARY_FILTER_TYPE_ALL ) {
		return {
			type: ICON_LIBRARY_FILTER_TYPE_ALL,
			label: entry.label,
			icon: typeof entry.icon === 'string' ? entry.icon : undefined,
		};
	}

	if ( entry.type === ICON_LIBRARY_FILTER_TYPE_ITEM && typeof entry.value === 'string' && entry.value !== '' ) {
		return {
			type: ICON_LIBRARY_FILTER_TYPE_ITEM,
			value: entry.value,
			label: entry.label,
			icon: typeof entry.icon === 'string' ? entry.icon : undefined,
		};
	}

	return null;
}
