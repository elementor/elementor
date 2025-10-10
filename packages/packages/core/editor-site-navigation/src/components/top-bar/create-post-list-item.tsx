import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { PlusIcon } from '@elementor/icons';
import { CircularProgress, ListItemIcon, ListItemText, MenuItem, type MenuItemProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import useCreatePage from '../../hooks/use-create-page';
import useUser from '../../hooks/use-user';

type Props = MenuItemProps & {
	closePopup: () => void;
};

export function CreatePostListItem( { closePopup, ...props }: Props ) {
	const { create, isLoading } = useCreatePage();
	const navigateToDocument = useNavigateToDocument();
	const { data: user } = useUser();

	return (
		<MenuItem
			disabled={ isLoading || ! user?.capabilities?.edit_pages }
			onClick={ async () => {
				const { id } = await create();
				closePopup();
				await navigateToDocument( id );
			} }
			{ ...props }
		>
			<ListItemIcon>
				{ isLoading ? <CircularProgress size="1.25rem" /> : <PlusIcon fontSize="small" /> }
			</ListItemIcon>
			<ListItemText
				primaryTypographyProps={ { variant: 'body2' } }
				primary={ __( 'Add new page', 'elementor' ) }
			/>
		</MenuItem>
	);
}
