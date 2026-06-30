import * as React from 'react';
import { useState } from 'react';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { TrashIcon } from '@elementor/icons';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
} from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { usePostListContext } from '../../../../contexts/post-list-context';
import { usePostActions } from '../../../../hooks/use-posts-actions';
import { type Post } from '../../../../types';
import ActionMenuItem from '../action-menu-item';

export default function Delete( { post }: { post: Post } ) {
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );
	const activeDocument = useActiveDocument();

	const isPostActive = activeDocument?.id === post.id;
	const userCanDelete = post.user_can.delete;

	const isDisabled = ! userCanDelete || post.isHome || isPostActive;

	return (
		<>
			<ActionMenuItem
				title={ __( 'Delete', 'elementor' ) }
				icon={ TrashIcon }
				MenuItemProps={ {
					disabled: isDisabled,
					onClick: () => setIsDialogOpen( true ),
					sx: { '&:hover': { color: 'error.main' } },
				} }
			/>

			{ isDialogOpen && <DeleteDialog post={ post } setIsDialogOpen={ setIsDialogOpen } /> }
		</>
	);
}

function DeleteDialog( {
	post,
	setIsDialogOpen,
}: {
	post: Post;
	setIsDialogOpen: React.Dispatch< React.SetStateAction< boolean > >;
} ) {
	const { type } = usePostListContext();
	const { deletePost } = usePostActions( type );
	const { setError } = usePostListContext();

	/* translators: %s: Post title. */
	const dialogTitle = sprintf( __( 'Delete "%s"?', 'elementor' ), post.title.rendered );

	const deletePage = async () => {
		try {
			await deletePost.mutateAsync( post.id );
		} catch {
			setError();
			setIsDialogOpen( false );
		}
	};

	const handleCancel = () => {
		if ( deletePost.isPending ) {
			return;
		}

		setIsDialogOpen( false );
	};

	return (
		<Dialog open={ true } onClose={ handleCancel } aria-labelledby="delete-dialog">
			<DialogTitle noWrap>{ dialogTitle }</DialogTitle>
			<Divider />
			<DialogContent>
				<DialogContentText>
					{ __(
						'The page and its content will be deleted forever and we won’t be able to recover them.',
						'elementor'
					) }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					color="secondary"
					onClick={ handleCancel }
					disabled={ deletePost.isPending }
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button variant="contained" color="error" onClick={ deletePage } disabled={ deletePost.isPending }>
					{ ! deletePost.isPending ? __( 'Delete', 'elementor' ) : <CircularProgress /> }
				</Button>
			</DialogActions>
		</Dialog>
	);
}
