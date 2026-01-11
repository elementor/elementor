import * as React from 'react';
<<<<<<< HEAD
import { createElement, useRef } from 'react';
import { PlusIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, type PopupState, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
=======
import { createElement, useMemo, useRef, useState } from 'react';
import { PromotionChip, PromotionPopover } from '@elementor/editor-ui';
import { PlusIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, type PopupState, Typography } from '@elementor/ui';
import { capitalize } from '@elementor/utils';
import { __, sprintf } from '@wordpress/i18n';
>>>>>>> 0a3623cb2b (Fix: Promotions triggers [ED-22272] (#34119))

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

	const menuOptions = Object.entries( variableTypes ).map( ( [ key, variable ] ) => {
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

<<<<<<< HEAD
=======
const MenuOption = ( {
	config,
	variables,
	onCreate,
	onClose,
}: {
	config: MenuOptionConfig;
	variables: TVariablesList;
	onCreate: VariableManagerCreateMenuProps[ 'onCreate' ];
	onClose: () => void;
} ) => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const userQuotaPermissions = useQuotaPermissions( config.propTypeKey );

	const displayName = capitalize( config.variableType );
	const isDisabled = ! userQuotaPermissions.canAdd();

	const handleClick = () => {
		if ( isDisabled ) {
			if ( ! isPopoverOpen ) {
				setIsPopoverOpen( true );
			}
			return;
		}

		const defaultName = getDefaultName( variables, config.key, config.variableType );

		onCreate( config.key, defaultName, config.defaultValue );
		trackVariablesManagerEvent( { action: 'add', varType: config.variableType } );
		onClose();
	};

	const title = sprintf(
		/* translators: %s: Variable Type. */
		__( '%s variables', 'elementor' ),
		capitalize( config.variableType )
	);

	const content = sprintf(
		/* translators: %s: Variable Type. */
		__( 'Upgrade to continue creating and editing %s variables.', 'elementor' ),
		config.variableType
	);

	return (
		<MenuItem onClick={ handleClick } sx={ { gap: 1.5, cursor: 'pointer' } }>
			{ createElement( config.icon, { fontSize: SIZE, color: isDisabled ? 'disabled' : 'action' } ) }
			<Typography variant="caption" color={ isDisabled ? 'text.disabled' : 'text.primary' }>
				{ displayName }
			</Typography>
			{ isDisabled && (
				<PromotionPopover
					open={ isPopoverOpen }
					title={ title }
					content={ content }
					ctaText={ __( 'Upgrade now', 'elementor' ) }
					ctaUrl={ `https://go.elementor.com/go-pro-manager-${ config.variableType }-variable/` }
					onClose={ () => {
						setIsPopoverOpen( false );
					} }
				>
					<PromotionChip />
				</PromotionPopover>
			) }
		</MenuItem>
	);
};

>>>>>>> 0a3623cb2b (Fix: Promotions triggers [ED-22272] (#34119))
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
