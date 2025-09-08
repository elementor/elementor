import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { bindMenu, Menu, type PopupState, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ComponentsMenu = ( { popupState }: { popupState: PopupState } ) => {
	return (
		<Menu
			{ ...bindMenu( popupState ) }
			anchorOrigin={ {
				vertical: 'bottom',
				horizontal: 'right',
			} }
			transformOrigin={ {
				vertical: 'top',
				horizontal: 'right',
			} }
		>
			<MenuListItem sx={ { minWidth: '160px' } } onClick={ () => {} }>
				<Typography variant="caption" sx={ { color: 'text.primary' } }>
					{ __( 'Rename', 'elementor' ) }
				</Typography>
			</MenuListItem>
			<MenuListItem
				onClick={ () => {
					popupState.close();
				} }
			>
				<Typography variant="caption" sx={ { color: 'error.light' } }>
					{ __( 'Delete', 'elementor' ) }
				</Typography>
			</MenuListItem>
		</Menu>
	);
};
