import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { usePostActions } from '../../../../hooks/use-posts-actions';
import EditModeTemplate from './edit-mode-template';

export default function ListItemDuplicate() {
	const { type, editMode, resetEditMode } = usePostListContext();
	const navigateToDocument = useNavigateToDocument();
	const { duplicatePost } = usePostActions( type );
	const { setError } = usePostListContext();

	if ( 'duplicate' !== editMode.mode ) {
		return null;
	}

	const duplicatePostCallback = async ( inputValue: string ) => {
		try {
			const { post_id: postId } = await duplicatePost.mutateAsync( {
				id: editMode.details.postId,
				title: inputValue,
			} );

			navigateToDocument( postId );
		} catch {
			setError();
		} finally {
			resetEditMode();
		}
	};

	return (
		<EditModeTemplate
			postTitle={ `${ editMode.details.title } ${ __( 'copy', 'elementor' ) }` }
			isLoading={ duplicatePost.isPending }
			callback={ duplicatePostCallback }
		/>
	);
}
