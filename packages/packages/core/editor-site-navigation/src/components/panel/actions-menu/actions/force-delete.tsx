import * as React from 'react';
import { useState } from 'react';
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

export default function ForceDelete( { post }: { post: Post } ) {
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	return (
		<>
			<ActionMenuItem
				icon={ TrashIcon }
				MenuItemProps={ {
					disabled: ! post.user_can.delete,
					onClick: () => setIsDialogOpen( true ),
					sx: { '&:hover': { color: 'error.main' } },
				} }
				title={ __( 'Delete permanently', 'elementor' ) }
			/>
			{ isDialogOpen && <ForceDeleteDialog post={ post } setIsDialogOpen={ setIsDialogOpen } /> }
		</>
	);
}

function ForceDeleteDialog( {
	post,
	setIsDialogOpen,
}: {
	post: Post;
	setIsDialogOpen: React.Dispatch< React.SetStateAction< boolean > >;
} ) {
	const { setError, type } = usePostListContext();
	const { forceDeletePost } = usePostActions( type );

	/* translators: %s: Post title. */
	const dialogTitle = sprintf( __( 'Delete "%s" permanently?', 'elementor' ), post.title.rendered );
	const dialogBody = __( 'This will permanently delete the item. You cannot undo this action.', 'elementor' );

	const handleDelete = async () => {
		try {
			await forceDeletePost.mutateAsync( post.id );
			setIsDialogOpen( false );
		} catch {
			setError();
			setIsDialogOpen( false );
		}
	};

	const handleCancel = () => {
		if ( forceDeletePost.isPending ) {
			return;
		}

		setIsDialogOpen( false );
	};

	return (
		<Dialog aria-labelledby="force-delete-dialog" onClose={ handleCancel } open>
			<DialogTitle noWrap>{ dialogTitle }</DialogTitle>
			<Divider />
			<DialogContent>
				<DialogContentText>{ dialogBody }</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					color="secondary"
					onClick={ handleCancel }
					disabled={ forceDeletePost.isPending }
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={ () => void handleDelete() }
					disabled={ forceDeletePost.isPending }
				>
					{ ! forceDeletePost.isPending ? __( 'Delete permanently', 'elementor' ) : <CircularProgress /> }
				</Button>
			</DialogActions>
		</Dialog>
	);
}
