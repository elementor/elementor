import * as React from 'react';
import { createElement } from 'react';
import { DotsVerticalIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, type SvgIconProps, usePopupState } from '@elementor/ui';

export type VariableManagerMenuAction = {
	name: string;
	icon: React.ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & React.RefAttributes< SVGSVGElement > >;
	color: string;
	onClick: () => void;
};

type VariableEditMenuProps = {
	menuActions: VariableManagerMenuAction[];
	disabled?: boolean;
};

export const VariableEditMenu = ( { menuActions, disabled }: VariableEditMenuProps ) => {
	const menuState = usePopupState( {
		variant: 'popover',
	} );

	return (
		<>
			<IconButton { ...bindTrigger( menuState ) } disabled={ disabled } size="tiny">
				<DotsVerticalIcon fontSize="tiny" />
			</IconButton>

			<Menu
				disablePortal
				MenuListProps={ {
					dense: true,
				} }
				PaperProps={ {
					elevation: 6,
				} }
				{ ...bindMenu( menuState ) }
				anchorEl={ menuState.anchorEl }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				open={ menuState.isOpen }
				onClose={ menuState.close }
			>
				{ menuActions.map( ( action ) => (
					<MenuItem
						key={ action.name }
						onClick={ () => {
							action.onClick?.();
							menuState.close();
						} }
						sx={ {
							color: action.color,
							gap: 1,
						} }
					>
						{ action.icon &&
							createElement( action.icon, {
								fontSize: 'inherit',
							} ) }{ ' ' }
						{ action.name }
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
};
