import type { ReactNode } from 'react';

export type SiteContentHeaderCreateItem = {
	id: string;
	priority?: number;
	renderMenuItem: ( onSelect: () => void ) => ReactNode;
};

const registeredHeaderCreateItems = new Map< string, SiteContentHeaderCreateItem >();

const DEFAULT_HEADER_CREATE_PRIORITY = 0;

export function registerSiteContentHeaderCreateItem( item: SiteContentHeaderCreateItem ) {
	registeredHeaderCreateItems.set( item.id, item );
}

export function getSiteContentHeaderCreateItems(): SiteContentHeaderCreateItem[] {
	return Array.from( registeredHeaderCreateItems.values() ).sort( ( first, second ) => {
		const firstPriority = first.priority ?? DEFAULT_HEADER_CREATE_PRIORITY;
		const secondPriority = second.priority ?? DEFAULT_HEADER_CREATE_PRIORITY;

		return firstPriority - secondPriority;
	} );
}

export function resetSiteContentHeaderCreateItems() {
	registeredHeaderCreateItems.clear();
}
