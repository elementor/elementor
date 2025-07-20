import * as React from 'react';
import { useRef, useState } from 'react';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { EditableField, EllipsisWithTooltip, MenuListItem, useEditable, WarningInfotip } from '@elementor/editor-ui';
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

import { CssClassUsageTrigger } from '../css-class-usage/components';
import { useDeleteConfirmation } from './delete-confirmation-dialog';
import { SortableTrigger, type SortableTriggerProps } from './sortable';

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
	const [ selectedCssUsage, setSelectedCssUsage ] = useState( '' );
	const { openDialog } = useDeleteConfirmation();

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const isSelected = ( selectedCssUsage === id || selected || popupState.isOpen ) && ! disabled;

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
						<Box className={ 'class-item-locator' }>
							<CssClassUsageTrigger id={ id } onClick={ setSelectedCssUsage } />
						</Box>
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

const StyledListItemButton = styled( ListItemButton, {
	shouldForwardProp: ( prop: string ) => ! [ 'showActions', 'showSortIndicator' ].includes( prop ),
} )< ListItemButtonProps & { showActions: boolean; showSortIndicator: boolean } >(
	( { showActions, showSortIndicator } ) => `
    min-height: 36px;

    &.visible-class-item {
      box-shadow: none !important;
    }

    .class-item-locator {
      visibility: hidden;
    }

    .class-item-sortable-trigger {
      visibility: ${ showSortIndicator && showActions ? 'visible' : 'hidden' };
    }

    &:hover:not(:disabled) {
      .class-item-locator {
        visibility: visible;
      }

      .class-item-sortable-trigger {
        visibility: ${ showSortIndicator ? 'visible' : 'hidden' };
      }
    }
  `
);

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
