import * as React from 'react';
import { useRef } from 'react';
import { EXPERIMENTAL_FEATURES } from '@elementor/editor-editing-panel';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { EditableField, EllipsisWithTooltip, MenuListItem, useEditable, WarningInfotip } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { DotsVerticalIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	ListItemButton,
	type ListItemButtonProps,
	Menu,
	Stack,
	styled,
	type Theme,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useDeleteConfirmation } from './delete-confirmation-dialog';
import { SortableTrigger, type SortableTriggerProps } from './sortable';

const isVersion311IsActive = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_31 );

type ClassItemProps = React.PropsWithChildren< {
	id: string;
	label: string;
	renameClass: ( newLabel: string ) => void;
	selected?: boolean;
	disabled?: boolean;
	sortableTriggerProps: SortableTriggerProps;
	isSearchActive: boolean;
} >;

export const ClassItem = ( {
	id,
	label,
	renameClass,
	selected,
	disabled,
	sortableTriggerProps,
	isSearchActive,
}: ClassItemProps ) => {
	const itemRef = useRef< HTMLElement >( null );

	const {
		ref: editableRef,
		openEditMode,
		isEditing,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: label,
		onSubmit: renameClass,
		validation: validateLabel,
	} );

	const { openDialog } = useDeleteConfirmation();

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const isSelected = ( selected || popupState.isOpen ) && ! disabled;
	return (
		<>
			<Stack p={ 0 }>
				<WarningInfotip
					open={ Boolean( error ) }
					text={ error ?? '' }
					placement="bottom"
					width={ itemRef.current?.getBoundingClientRect().width }
					offset={ [ 0, -15 ] }
				>
					<StyledListItemButton
						ref={ itemRef }
						dense
						disableGutters
						showSortIndicator={ isSearchActive }
						showActions={ isSelected || isEditing }
						shape="rounded"
						onDoubleClick={ openEditMode }
						selected={ isSelected }
						disabled={ disabled }
						focusVisibleClassName="visible-class-item"
					>
						<SortableTrigger { ...sortableTriggerProps } />
						<Indicator isActive={ isEditing } isError={ !! error }>
							{ isEditing ? (
								<EditableField
									ref={ editableRef }
									as={ Typography }
									variant="caption"
									{ ...getEditableProps() }
								/>
							) : (
								<EllipsisWithTooltip title={ label } as={ Typography } variant="caption" />
							) }
						</Indicator>
						<Tooltip
							placement="top"
							className={ 'class-item-more-actions' }
							title={ __( 'More actions', 'elementor' ) }
						>
							<IconButton size="tiny" { ...bindTrigger( popupState ) } aria-label="More actions">
								<DotsVerticalIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
					</StyledListItemButton>
				</WarningInfotip>
			</Stack>
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
				<MenuListItem
					sx={ { minWidth: '160px' } }
					onClick={ () => {
						popupState.close();
						openEditMode();
					} }
				>
					<Typography variant="caption" sx={ { color: 'text.primary' } }>
						{ __( 'Rename', 'elementor' ) }
					</Typography>
				</MenuListItem>
				<MenuListItem
					onClick={ () => {
						popupState.close();
						openDialog( { id, label } );
					} }
				>
					<Typography variant="caption" sx={ { color: 'error.light' } }>
						{ __( 'Delete', 'elementor' ) }
					</Typography>
				</MenuListItem>
			</Menu>
		</>
	);
};

// Custom styles for sortable list item, until the component is available in the UI package.

//  Experimental start

const StyledListItemButtonV2 = styled( ListItemButton, {
	shouldForwardProp: ( prop: string ) => ! [ 'showActions', 'showSortIndicator' ].includes( prop ),
} )< ListItemButtonProps & { showActions: boolean; showSortIndicator: boolean } >(
	( { showActions, showSortIndicator } ) =>
		`
	min-height: 36px;

	&.visible-class-item {
		box-shadow: none !important;
	}
	.class-item-sortable-trigger {
		visibility: ${ showSortIndicator && showActions ? 'visible' : 'hidden' };
	}
	&:hover&:not(:disabled) {
		.class-item-sortable-trigger  {
			visibility: ${ showSortIndicator ? 'visible' : 'hidden' };
		}
	}
`
);

const StyledListItemButtonV1 = styled( ListItemButton, {
	shouldForwardProp: ( prop: string ) => ! [ 'showActions', 'showSortIndicator' ].includes( prop ),
} )< ListItemButtonProps & { showActions: boolean; showSortIndicator: boolean } >(
	( { showActions } ) => `
	min-height: 36px;
	&.visible-class-item {
		box-shadow: none !important;
	}
	.class-item-more-actions, .class-item-sortable-trigger {
		visibility: ${ showActions ? 'visible' : 'hidden' };
	}
	.class-item-sortable-trigger {
		visibility: ${ showActions ? 'visible' : 'hidden' };
	}
	&:hover&:not(:disabled) {
		.class-item-more-actions, .class-item-sortable-trigger  {
			visibility: visible;
		}
	}
`
);
//  Experimental start

const StyledListItemButton = isVersion311IsActive ? StyledListItemButtonV2 : StyledListItemButtonV1;

const Indicator = styled( Box, {
	shouldForwardProp: ( prop: string ) => ! [ 'isActive', 'isError' ].includes( prop ),
} )< { isActive: boolean; isError: boolean } >( ( { theme, isActive, isError } ) => ( {
	display: 'flex',
	width: '100%',
	flexGrow: 1,
	borderRadius: theme.spacing( 0.5 ),
	border: getIndicatorBorder( { isActive, isError, theme } ),
	padding: `0 ${ theme.spacing( 1 ) }`,
	marginLeft: isActive ? theme.spacing( 1 ) : 0,
	minWidth: 0,
} ) );

const getIndicatorBorder = ( { isActive, isError, theme }: { isActive: boolean; isError: boolean; theme: Theme } ) => {
	if ( isError ) {
		return `2px solid ${ theme.palette.error.main }`;
	}

	if ( isActive ) {
		return `2px solid ${ theme.palette.secondary.main }`;
	}

	return 'none';
};

const validateLabel = ( newLabel: string ) => {
	const result = validateStyleLabel( newLabel, 'rename' );

	if ( result.isValid ) {
		return null;
	}

	return result.errorMessage;
};
