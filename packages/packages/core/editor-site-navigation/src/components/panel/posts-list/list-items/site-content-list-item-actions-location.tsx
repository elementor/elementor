import { createLocation } from '@elementor/locations';

import { type Post } from '../../../../types';

export type SiteContentListItemActionsProps = {
	post: Post;
	title: string;
};

export const {
	Slot: SiteContentListItemActionsSlot,
	inject: injectIntoSiteContentListItemActions,
	useInjections: useSiteContentListItemActionsInjections,
} = createLocation< SiteContentListItemActionsProps >();
