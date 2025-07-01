import * as React from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { stylesRepository, useUserStylesCapability } from '@elementor/editor-styles-repository';
import { MenuItemInfotip, MenuListItem } from '@elementor/editor-ui';
import { bindMenu, Divider, Menu, MenuSubheader, type PopupState, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useStyle } from '../../contexts/style-context';
import { type StyleDefinitionStateWithNormal } from '../../styles-inheritance/types';
import { getTempStylesProviderThemeColor } from '../../utils/get-styles-provider-color';
import { StyleIndicator } from '../style-indicator';
import { useCssClass } from './css-class-context';
import { useUnapplyClass } from './use-apply-and-unapply-class';

type State = {
	key: StyleDefinitionStateWithNormal;
	value: StyleDefinitionState | null;
};

const STATES: State[] = [
	{ key: 'normal', value: null },
	{ key: 'hover', value: 'hover' },
	{ key: 'focus', value: 'focus' },
	{ key: 'active', value: 'active' },
];

type CssClassMenuProps = {
	popupState: PopupState;
	anchorEl: HTMLElement | null;
	fixed?: boolean;
};

export function CssClassMenu( { popupState, anchorEl, fixed }: CssClassMenuProps ) {
	const { provider } = useCssClass();

	const handleKeyDown = ( e: React.KeyboardEvent< HTMLElement > ) => {
		e.stopPropagation();
	};

	return (
		<Menu
			MenuListProps={ { dense: true, sx: { minWidth: '160px' } } }
			{ ...bindMenu( popupState ) }
			anchorEl={ anchorEl }
			anchorOrigin={ {
				vertical: 'bottom',
				horizontal: 'left',
			} }
			transformOrigin={ {
				horizontal: 'left',
				vertical: -4,
			} }
			onKeyDown={ handleKeyDown }
			// Workaround for focus-visible issue.
			disableAutoFocusItem
		>
			{ /* It has to be an array since MUI menu doesn't accept a Fragment as a child, and wrapping the items with an HTML element disrupts keyboard navigation */ }
			{ getMenuItemsByProvider( { provider, closeMenu: popupState.close, fixed } ) }
			<MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
				{ __( 'States', 'elementor' ) }
			</MenuSubheader>
			{ STATES.map( ( state ) => {
				return <StateMenuItem key={ state.key } state={ state.value } closeMenu={ popupState.close } />;
			} ) }
		</Menu>
	);
}

function useModifiedStates( styleId: string | null ): Partial< Record< StyleDefinitionStateWithNormal, true > > {
	const { meta } = useStyle();

	const styleDef = stylesRepository.all().find( ( style ) => style.id === styleId );

	return Object.fromEntries(
		styleDef?.variants
			.filter( ( variant ) => meta.breakpoint === variant.meta.breakpoint )
			.map( ( variant ) => [ variant.meta.state ?? 'normal', true ] ) ?? []
	);
}

function getMenuItemsByProvider( {
	provider,
	closeMenu,
	fixed,
}: {
	provider: string | null;
	closeMenu: () => void;
	fixed?: boolean;
} ) {
	if ( ! provider ) {
		return [];
	}

	const providerInstance = stylesRepository.getProviderByKey( provider );
	const providerActions = providerInstance?.actions;

	const canUpdate = providerActions?.update;
	const canUnapply = ! fixed;

	const actions = [
		canUpdate && <RenameClassMenuItem key="rename-class" closeMenu={ closeMenu } />,
		canUnapply && <UnapplyClassMenuItem key="unapply-class" closeMenu={ closeMenu } />,
	].filter( Boolean );

	if ( actions.length ) {
		actions.unshift(
			<MenuSubheader
				key="provider-label"
				sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1, textTransform: 'capitalize' } }
			>
				{ providerInstance?.labels?.singular }
			</MenuSubheader>
		);
		actions.push( <Divider key="provider-actions-divider" /> );
	}

	return actions;
}

type StateMenuItemProps = {
	state: StyleDefinitionState;
	closeMenu: () => void;
};

function StateMenuItem( { state, closeMenu, ...props }: StateMenuItemProps ) {
	const { id: styleId, provider } = useCssClass();
	const { id: activeId, setId: setActiveId, setMetaState: setActiveMetaState, meta } = useStyle();
	const { state: activeState } = meta;
	const { userCan } = useUserStylesCapability();

	const modifiedStates = useModifiedStates( styleId );

	const isUpdateAllowed = ! state || userCan( provider ?? '' ).updateProps;

	const isStyled = modifiedStates[ state ?? 'normal' ] ?? false;
	const disabled = ! isUpdateAllowed && ! isStyled;
	const isActive = styleId === activeId;
	const isSelected = state === activeState && isActive;

	return (
		<MenuListItem
			{ ...props }
			selected={ isSelected }
			disabled={ disabled }
			sx={ { textTransform: 'capitalize' } }
			onClick={ () => {
				if ( ! isActive ) {
					setActiveId( styleId );
				}

				setActiveMetaState( state );

				closeMenu();
			} }
		>
			<MenuItemInfotip
				showInfoTip={ disabled }
				content={ __( 'With your current role, you can only use existing states.', 'elementor' ) }
			>
				<Stack gap={ 0.75 } direction="row" alignItems="center">
					{ isStyled && (
						<StyleIndicator
							aria-label={ __( 'Has style', 'elementor' ) }
							getColor={ getTempStylesProviderThemeColor( provider ?? '' ) }
						/>
					) }
					{ state ?? 'normal' }
				</Stack>
			</MenuItemInfotip>
		</MenuListItem>
	);
}

function UnapplyClassMenuItem( { closeMenu, ...props }: { closeMenu: () => void } ) {
	const { id: classId, label: classLabel } = useCssClass();
	const unapplyClass = useUnapplyClass();

	return classId ? (
		<MenuListItem
			{ ...props }
			onClick={ () => {
				unapplyClass( { classId, classLabel } );
				closeMenu();
			} }
		>
			{ __( 'Remove', 'elementor' ) }
		</MenuListItem>
	) : null;
}

function RenameClassMenuItem( { closeMenu }: { closeMenu: () => void } ) {
	const { handleRename, provider } = useCssClass();
	const { userCan } = useUserStylesCapability();

	if ( ! provider ) {
		return null;
	}

	const isAllowed = userCan( provider ).update;

	return (
		<MenuListItem
			disabled={ ! isAllowed }
			onClick={ () => {
				closeMenu();
				handleRename();
			} }
		>
			<MenuItemInfotip
				showInfoTip={ ! isAllowed }
				content={ __(
					'With your current role, you can use existing classes but can’t modify them.',
					'elementor'
				) }
			>
				{ __( 'Rename', 'elementor' ) }
			</MenuItemInfotip>
		</MenuListItem>
	);
}
