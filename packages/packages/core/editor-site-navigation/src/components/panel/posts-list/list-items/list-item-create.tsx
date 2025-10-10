import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { usePostActions } from '../../../../hooks/use-posts-actions';
import EditModeTemplate from './edit-mode-template';

export default function ListItemCreate() {
	const { type, resetEditMode } = usePostListContext();
	const { createPost } = usePostActions( type );
	const navigateToDocument = useNavigateToDocument();
	const { setError } = usePostListContext();

	const createPostCallback = async ( inputValue: string ) => {
		try {
			const { id } = await createPost.mutateAsync( {
				title: inputValue,
				status: 'draft',
			} );

			navigateToDocument( id );
		} catch {
			setError();
		} finally {
			resetEditMode();
		}
	};

	return (
		<EditModeTemplate
			postTitle={ __( 'New Page', 'elementor' ) }
			isLoading={ createPost.isPending }
			callback={ createPostCallback }
		/>
	);
}
