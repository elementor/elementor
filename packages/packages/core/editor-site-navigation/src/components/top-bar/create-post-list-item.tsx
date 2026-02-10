import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { useMixpanel } from '@elementor/events';
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
	const { dispatchEvent, config } = useMixpanel();

	return (
		<MenuItem
			disabled={ isLoading || ! user?.capabilities?.edit_pages }
			onClick={ async () => {
				const eventName = config?.names?.editorOne?.topBarPageList;
				if ( eventName ) {
					dispatchEvent?.( eventName, {
						app_type: config?.appTypes?.editor,
						window_name: config?.appTypes?.editor,
						interaction_type: config?.triggers?.click?.toLowerCase(),
						target_type: config?.targetTypes?.dropdownItem,
						target_name: config?.targetNames?.pageList?.addNewPage,
						interaction_result: config?.interactionResults?.create,
						target_location: config?.locations?.topBar?.replace( /\s+/g, '_' ).toLowerCase(),
						location_l1: config?.secondaryLocations?.pageListDropdown?.replace( /\s+/g, '_' ).toLowerCase(),
						location_l2: config?.targetTypes?.dropdownItem,
					} );
				}
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
