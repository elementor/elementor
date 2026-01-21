import * as React from 'react';
import { createElement, useMemo, useRef, useState } from 'react';
import { PromotionChip, PromotionPopover } from '@elementor/editor-ui';
import { PlusIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, type PopupState, Typography } from '@elementor/ui';
import { capitalize } from '@elementor/utils';
import { __, sprintf } from '@wordpress/i18n';

import { useQuotaPermissions } from '../../hooks/use-quota-permissions';
import { type TVariablesList } from '../../storage';
import { trackVariablesManagerEvent } from '../../utils/tracking';
import { getVariableTypes } from '../../variables-registry/variable-type-registry';

export const SIZE = 'tiny';

type MenuOptionConfig = {
	key: string;
	propTypeKey: string;
	variableType: string;
	defaultValue: string;
	icon: React.ElementType;
};

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

	const menuOptionConfigs = useMemo(
		() =>
			Object.entries( variableTypes )
				.filter( ( [ , variable ] ) => !! variable.defaultValue )
				.map( ( [ key, variable ] ) => ( {
					key,
					propTypeKey: variable.propTypeUtil.key,
					variableType: variable.variableType,
					defaultValue: variable.defaultValue || '',
					icon: variable.icon,
				} ) ),
		[ variableTypes ]
	);

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
				{ menuOptionConfigs.map( ( config ) => (
					<MenuOption
						key={ config.key }
						config={ config }
						variables={ variables }
						onCreate={ onCreate }
						onClose={ menuState.close }
					/>
				) ) }
			</Menu>
		</>
	);
};

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
