import { createLocation } from '@elementor/locations';

import { type Post } from '../../../../types';

export type SiteContentListItemActionsProps = {
	post: Post;
};

export const {
	Slot: SiteContentListItemActionsSlot,
	inject: injectIntoSiteContentListItemActions,
} = createLocation< SiteContentListItemActionsProps >();