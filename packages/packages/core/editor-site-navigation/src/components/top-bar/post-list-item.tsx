import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { useMixpanel } from '@elementor/events';
import { ListItemText, MenuItem, type MenuItemProps } from '@elementor/ui';

import { useReverseHtmlEntities } from '../../hooks/use-reverse-html-entities';
import { type RecentPost } from '../../types';
import DocTypeChip from './chip-doc-type';

type Props = MenuItemProps & {
	post: RecentPost;
	closePopup: () => void;
};

export function PostListItem( { post, closePopup, ...props }: Props ) {
	const navigateToDocument = useNavigateToDocument();
	const postTitle = useReverseHtmlEntities( post.title );
	const { dispatchEvent, config } = useMixpanel();

	return (
		<MenuItem
			disabled={ ! post.user_can.edit }
			onClick={ async () => {
				const eventName = config?.names?.editorOne?.topBarPageList;
				if ( eventName ) {
					dispatchEvent?.( eventName, {
						app_type: config?.appTypes?.editor,
						window_name: config?.appTypes?.editor,
						interaction_type: config?.triggers?.click?.toLowerCase(),
						target_type: config?.targetTypes?.dropdownItem,
						target_name: postTitle,
						interaction_result: config?.interactionResults?.navigate,
						target_location: config?.locations?.topBar?.replace( /\s+/g, '_' ).toLowerCase(),
						location_l1: config?.secondaryLocations?.pageListDropdown?.replace( /\s+/g, '_' ).toLowerCase(),
						location_l2: config?.targetTypes?.dropdownItem,
					} );
				}
				closePopup();
				await navigateToDocument( post.id );
			} }
			{ ...props }
		>
			<ListItemText
				sx={ { flexGrow: 0 } }
				primaryTypographyProps={ { variant: 'body2', noWrap: true } }
				primary={ postTitle }
			/>
			<DocTypeChip postType={ post.type.post_type } docType={ post.type.doc_type } label={ post.type.label } />
		</MenuItem>
	);
}
