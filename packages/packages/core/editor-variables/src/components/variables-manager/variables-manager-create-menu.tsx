import * as React from 'react';
import { createElement } from 'react';
import { BrushIcon, ExpandIcon, PlusIcon, TextIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, Typography, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { type TVariablesList } from '../../storage';

export const SIZE = 'tiny';

const DEFAULT_COLOR_VALUE = __( '#ffffff', 'elementor' );
const DEFAULT_FONT_VALUE = __( 'Roboto', 'elementor' );

type VariableManagerPlusMenuProps = {
	variables: TVariablesList;
	onCreate: ( type: string, defaultName: string, defaultValue: string ) => void;
	disabled?: boolean;
};

export const VariableManagerPlusMenu = ( { variables, onCreate, disabled }: VariableManagerPlusMenuProps ) => {
	const menuState = usePopupState( {
		variant: 'popover',
	} );

	const menuOptions = [
		{
			key: 'color',
			name: __( 'Color', 'elementor' ),
			icon: BrushIcon,
			onClick: () => {
				const defaultName = getDefaultName( variables, colorVariablePropTypeUtil.key, 'color' );
				onCreate( colorVariablePropTypeUtil.key, defaultName, DEFAULT_COLOR_VALUE );
			},
		},
		{
			key: 'font',
			name: __( 'Font', 'elementor' ),
			icon: TextIcon,
			onClick: () => {
				const defaultName = getDefaultName( variables, fontVariablePropTypeUtil.key, 'font' );
				onCreate( fontVariablePropTypeUtil.key, defaultName, DEFAULT_FONT_VALUE );
			},
		},
		{
			key: 'size',
			name: __( 'Size', 'elementor' ),
			icon: ExpandIcon,
			onClick: () => {},
		},
	];

	return (
		<>
			<IconButton
				{ ...bindTrigger( menuState ) }
				disabled={ disabled }
				size={ SIZE }
				aria-label={ __( 'Add variable', 'elementor' ) }
			>
				<PlusIcon fontSize={ SIZE } />
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
				{ menuOptions.map( ( option ) => (
					<MenuItem
						key={ option.key }
						onClick={ () => {
							option.onClick?.();
							menuState.close();
						} }
						sx={ {
							gap: 1.5,
						} }
					>
						{ createElement( option.icon, {
							fontSize: SIZE,
							color: 'action',
						} ) }
						<Typography variant="caption" color="text.primary">
							{ option.name }
						</Typography>
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
};

const getDefaultName = ( variables: TVariablesList, type: string, baseName: string ) => {
	const existingNames = Object.values( variables )
		.filter( ( variable ) => variable.type === type )
		.map( ( variable ) => variable.label );

	let counter = 1;
	let name = `${ baseName }-${ counter }`;

	while ( existingNames.includes( name ) ) {
		counter++;
		name = `${ baseName }-${ counter }`;
	}

	return name;
};
