import * as React from 'react';

import { usePostListContext } from '../../../contexts/post-list-context';
import { type Post } from '../../../types';
import ListItemCreate from './list-items/list-item-create';
import ListItemDuplicate from './list-items/list-item-duplicate';
import ListItemRename from './list-items/list-item-rename';
import ListItemView from './list-items/list-item-view';

export default function PostListItem( { post }: { post?: Post } ) {
	const { editMode } = usePostListContext();

	if ( 'rename' === editMode.mode && post?.id && post?.id === editMode.details.postId ) {
		return <ListItemRename post={ post } />;
	}

	if ( 'create' === editMode.mode && ! post ) {
		return <ListItemCreate />;
	}

	if ( 'duplicate' === editMode.mode && ! post ) {
		return <ListItemDuplicate />;
	}

	if ( ! post ) {
		return null;
	}

	return <ListItemView post={ post } />;
}
