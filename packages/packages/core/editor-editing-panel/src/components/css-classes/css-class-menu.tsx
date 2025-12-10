import * as React from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import {
	isElementsStylesProvider,
	stylesRepository,
	useUserStylesCapability,
} from '@elementor/editor-styles-repository';
import { MenuItemInfotip, MenuListItem } from '@elementor/editor-ui';
import { bindMenu, Divider, Menu, MenuSubheader, type PopupState, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';
import { type StyleDefinitionStateWithNormal } from '../../styles-inheritance/types';
import { getTempStylesProviderThemeColor } from '../../utils/get-styles-provider-color';
import { trackStyles } from '../../utils/tracking/subscribe';
import { StyleIndicator } from '../style-indicator';
import { useCssClass } from './css-class-context';
import { LocalClassSubMenu } from './local-class-sub-menu';
import { useUnapplyClass } from './use-apply-and-unapply-class';

type State = {
	key: StyleDefinitionStateWithNormal;
	value: StyleDefinitionState | null;
	label: string;
};

const STATES: State[] = [
	{ key: 'normal', value: null, label: __( 'normal', 'elementor' ) },
	{ key: 'hover', value: 'hover', label: __( 'hover', 'elementor' ) },
	{ key: 'focus', value: 'focus', label: __( 'focus', 'elementor' ) },
	{ key: 'active', value: 'active', label: __( 'active', 'elementor' ) },
];

type CssClassMenuProps = {
	popupState: PopupState;
	anchorEl: HTMLElement | null;
	fixed?: boolean;
};

export function CssClassMenu( { popupState, anchorEl, fixed }: CssClassMenuProps ) {
	const { provider } = useCssClass();
	const isLocalStyle = provider ? isElementsStylesProvider( provider ) : true;

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
			{ isLocalStyle && <LocalClassSubMenu popupState={ popupState } /> }
			{ /* It has to be an array since MUI menu doesn't accept a Fragment as a child, and wrapping the items with an HTML element disrupts keyboard navigation */ }
			{ getMenuItemsByProvider( { provider, closeMenu: popupState.close, fixed } ) }
			<MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
				{ __( 'States', 'elementor' ) }
			</MenuSubheader>
			{ STATES.map( ( state ) => {
				return (
					<StateMenuItem
						key={ state.key }
						state={ state.value }
						label={ state.label }
						closeMenu={ popupState.close }
					/>
				);
			} ) }
			<ClassStatesMenu closeMenu={ popupState.close } />
		</Menu>
	);
}

function ClassStatesMenu( { closeMenu }: { closeMenu: () => void } ) {
	const { elementStates, elementTitle } = useElementStates();

	if ( ! elementStates.length ) {
		return null;
	}

	/* translators: %s: Element type title. */
	const customTitle = __( '%s States', 'elementor' ).replace( '%s', elementTitle );

	return (
		<>
			<Divider />
			<MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
				{ customTitle }
			</MenuSubheader>
			{ elementStates.map( ( state ) => {
				return (
					<StateMenuItem
						key={ state.key }
						state={ state.value }
						label={ state.label }
						closeMenu={ closeMenu }
					/>
				);
			} ) }
		</>
	);
}

const CLASS_STATES_MAP: Record< string, { label: string } > = {
	selected: {
		label: __( 'selected', 'elementor' ),
	},
};

export function useElementStates() {
	const { elementType } = useElement();

	const { styleStates = [] } = elementType;

	const elementStates = styleStates.map( ( { value, name } ) => ( {
		key: value,
		value,
		label: CLASS_STATES_MAP[ value ]?.label ?? name,
	} ) );

	return {
		elementStates,
		elementTitle: elementType.title,
	};
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
	label: string;
	closeMenu: () => void;
};

function StateMenuItem( { state, label, closeMenu, ...props }: StateMenuItemProps ) {
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
				trackStyles( provider ?? '', 'classStateClicked', {
					classId: styleId,
					type: label,
					source: styleId ? 'global' : 'local',
				} );
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
					{ label }
				</Stack>
			</MenuItemInfotip>
		</MenuListItem>
	);
}

function UnapplyClassMenuItem( { ...props }: { closeMenu: () => void } ) {
	const { id: classId, label: classLabel, provider } = useCssClass();
	const unapplyClass = useUnapplyClass();

	return classId ? (
		<MenuListItem
			{ ...props }
			onClick={ () => {
				unapplyClass( { classId, classLabel } );
				trackStyles( provider ?? '', 'classRemoved', {
					classId,
					classTitle: classLabel,
					source: 'style-tab',
				} );
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
