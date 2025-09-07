import * as React from 'react';
import { createElement } from 'react';
import { PlusIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, Typography, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type TVariablesList } from '../../storage';
import { getVariableTypes } from '../../variables-registry/variable-type-registry';

export const SIZE = 'tiny';

type VariableManagerCreateMenuProps = {
	variables: TVariablesList;
	onCreate: ( type: string, defaultName: string, defaultValue: string ) => void;
	disabled?: boolean;
};

export const VariableManagerCreateMenu = ( { variables, onCreate, disabled }: VariableManagerCreateMenuProps ) => {
	const menuState = usePopupState( {
		variant: 'popover',
	} );

	const variableTypes = getVariableTypes();

	const menuOptions = Object.entries( variableTypes ).map( ( [ key, variable ] ) => {
		const displayName = variable.variableType.charAt( 0 ).toUpperCase() + variable.variableType.slice( 1 );

		return {
			key,
			name: displayName,
			icon: variable.icon,
			onClick: () => {
				const defaultName = getDefaultName( variables, key, variable.variableType );
				onCreate( key, defaultName, variable.defaultValue || '' );
			},
		};
	} );

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
