import { postTypesMap, type Slug } from './api/post';
import { getSiteContentSections } from './site-content-sections';

export type SiteContentPanelSectionDescriptor = {
	id: string;
	label: string;
};

export const SITE_CONTENT_PANEL_SECTIONS_FILTER_POPOVER_WIDTH_PX = 280;

export function getSiteContentPanelSectionDescriptors(
	accessiblePostTypes: Slug[]
): SiteContentPanelSectionDescriptor[] {
	const postTypeSections = accessiblePostTypes.map( ( slug ) => ( {
		id: slug,
		label: postTypesMap[ slug ].labels.plural_name,
	} ) );

	const registeredSections = getSiteContentSections().map( ( section ) => ( {
		id: section.id,
		label: section.label ?? section.id,
	} ) );

	return [ ...postTypeSections, ...registeredSections ];
}

export function hasHiddenSiteContentPanelSections( hiddenSectionIds: ReadonlySet< string > ): boolean {
	return hiddenSectionIds.size > 0;
}
