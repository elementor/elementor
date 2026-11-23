import * as React from 'react';
import { type SiteContentListItemActionsProps } from '@elementor/editor-site-navigation';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieSiteContentListItemAction = ( { post, title }: SiteContentListItemActionsProps ) => (
	<AngieGenerateButton
		prompt={ ANGIE_PROMPTS.siteContentActiveDocument( {
			postId: post.id,
			postType: post.type,
			title,
		} ) }
	/>
);