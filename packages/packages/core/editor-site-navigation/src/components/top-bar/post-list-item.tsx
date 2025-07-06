import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
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

	return (
		<MenuItem
			disabled={ ! post.user_can.edit }
			onClick={ async () => {
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
