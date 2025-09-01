import * as React from 'react';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { usePostActions } from '../../../../hooks/use-posts-actions';
import useRenameActiveDocument from '../../../../hooks/use-rename-active-document';
import { type Post } from '../../../../types';
import EditModeTemplate from './edit-mode-template';

type Props = {
	post: Post;
};

export default function ListItemRename( { post }: Props ) {
	const { type, resetEditMode } = usePostListContext();
	const { updatePost } = usePostActions( type );
	const { setError } = usePostListContext();
	const activeDocument = useActiveDocument();
	const rename = useRenameActiveDocument();

	const isActive = activeDocument?.id === post.id;
	const title = isActive ? activeDocument?.title : post.title.rendered;

	const renamePostCallback = async ( inputValue: string ) => {
		if ( inputValue === title ) {
			resetEditMode();
		}

		try {
			if ( isActive ) {
				await rename( inputValue );
			} else {
				await updatePost.mutateAsync( {
					id: post.id,
					title: inputValue,
				} );
			}
		} catch {
			setError();
		} finally {
			resetEditMode();
		}
	};

	return <EditModeTemplate postTitle={ title } isLoading={ updatePost.isPending } callback={ renamePostCallback } />;
}
