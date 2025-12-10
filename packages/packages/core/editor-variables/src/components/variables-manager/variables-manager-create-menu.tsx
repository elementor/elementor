import * as React from 'react';
import { createElement, useRef } from 'react';
import { PlusIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, type PopupState, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type TVariablesList } from '../../storage';
import { trackVariablesManagerEvent } from '../../utils/tracking';
import { getVariableTypes } from '../../variables-registry/variable-type-registry';

export const SIZE = 'tiny';

type VariableManagerCreateMenuProps = {
	variables: TVariablesList;
	onCreate: ( type: string, defaultName: string, defaultValue: string ) => void;
	disabled?: boolean;
	menuState: PopupState;
};

export const VariableManagerCreateMenu = ( {
	variables,
	onCreate,
	disabled,
	menuState,
}: VariableManagerCreateMenuProps ) => {
	const buttonRef = useRef< HTMLButtonElement >( null );

	const variableTypes = getVariableTypes();

	const menuOptions = Object.entries( variableTypes )
		.filter( ( [ , variable ] ) => !! variable.defaultValue )
		.map( ( [ key, variable ] ) => {
			const displayName = variable.variableType.charAt( 0 ).toUpperCase() + variable.variableType.slice( 1 );

			return {
				key,
				name: displayName,
				icon: variable.icon,
				onClick: () => {
					const defaultName = getDefaultName( variables, key, variable.variableType );
					onCreate( key, defaultName, variable.defaultValue || '' );
					trackVariablesManagerEvent( { action: 'add', varType: variable.variableType } );
				},
			};
		} );

	return (
		<>
			<IconButton
				{ ...bindTrigger( menuState ) }
				ref={ buttonRef }
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
				anchorEl={ buttonRef.current }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				data-testid="variable-manager-create-menu"
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
