import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { __, sprintf } from '@wordpress/i18n';

import { postTypesMap } from '../../../../api/post';
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

			resetEditMode();
			navigateToDocument( id );
		} catch {
			setError();
		} finally {
			resetEditMode();
		}
	};

	const newItemLabel = sprintf(
		/* translators: %s: Post type singular name (e.g. Page, Post). */
		__( 'New %s', 'elementor' ),
		postTypesMap[ type ].labels.singular_name
	);

	return (
		<EditModeTemplate
			postTitle={ newItemLabel }
			isLoading={ createPost.isPending }
			callback={ createPostCallback }
		/>
	);
}
