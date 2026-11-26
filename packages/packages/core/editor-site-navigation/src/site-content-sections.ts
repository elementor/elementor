import type { ReactNode } from 'react';

export type SiteContentSection = {
	id: string;
	label?: string;
	priority?: number;
	render: () => ReactNode;
};

const registeredSections = new Map< string, SiteContentSection >();

const DEFAULT_SECTION_PRIORITY = 0;

export function registerSiteContentSection( section: SiteContentSection ) {
	registeredSections.set( section.id, section );
}

export function getSiteContentSections(): SiteContentSection[] {
	return Array.from( registeredSections.values() ).sort(
		( first, second ) =>
			( first.priority ?? DEFAULT_SECTION_PRIORITY ) - ( second.priority ?? DEFAULT_SECTION_PRIORITY )
	);
}

export function resetSiteContentSections() {
	registeredSections.clear();
}
