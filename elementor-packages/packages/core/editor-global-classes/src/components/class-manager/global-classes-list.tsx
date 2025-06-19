import * as React from 'react';
import { useEffect, useRef } from 'react';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { EditableField, EllipsisWithTooltip, MenuListItem, useEditable, WarningInfotip } from '@elementor/editor-ui';
import { DotsVerticalIcon } from '@elementor/icons';
import { __useDispatch as useDispatch } from '@elementor/store';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	List,
	ListItemButton,
	type ListItemButtonProps,
	Menu,
	Stack,
	styled,
	type Theme,
	Tooltip,
	Typography,
	type TypographyProps,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useClassesOrder } from '../../hooks/use-classes-order';
import { useOrderedClasses } from '../../hooks/use-ordered-classes';
import { slice } from '../../store';
import { DeleteConfirmationProvider, useDeleteConfirmation } from './delete-confirmation-dialog';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { SortableItem, SortableProvider, SortableTrigger, type SortableTriggerProps } from './sortable';

export const GlobalClassesList = ( { disabled }: { disabled?: boolean } ) => {
	const cssClasses = useOrderedClasses();
	const dispatch = useDispatch();

	const [ classesOrder, reorderClasses ] = useReorder();

	useEffect( () => {
		const handler = ( event: KeyboardEvent ) => {
			if ( event.key === 'z' && ( event.ctrlKey || event.metaKey ) ) {
				event.stopImmediatePropagation();
				event.preventDefault();
				if ( event.shiftKey ) {
					dispatch( slice.actions.redo() );
					return;
				}
				dispatch( slice.actions.undo() );
			}
		};
		window.addEventListener( 'keydown', handler, {
			capture: true,
		} );
		return () => window.removeEventListener( 'keydown', handler );
	}, [ dispatch ] );

	if ( ! cssClasses?.length ) {
		return <EmptyState />;
	}

	return (
		<DeleteConfirmationProvider>
			<List sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
				<SortableProvider value={ classesOrder } onChange={ reorderClasses }>
					{ cssClasses?.map( ( { id, label } ) => {
						const renameClass = ( newLabel: string ) => {
							dispatch(
								slice.actions.update( {
									style: {
										id,
										label: newLabel,
									},
								} )
							);
						};

						return (
							<SortableItem key={ id } id={ id }>
								{ ( { isDragged, isDragPlaceholder, triggerProps, triggerStyle } ) => (
									<ClassItem
										id={ id }
										label={ label }
										renameClass={ renameClass }
										selected={ isDragged }
										disabled={ disabled || isDragPlaceholder }
										sortableTriggerProps={ { ...triggerProps, style: triggerStyle } }
									/>
								) }
							</SortableItem>
						);
					} ) }
				</SortableProvider>
			</List>
		</DeleteConfirmationProvider>
	);
};

const useReorder = () => {
	const dispatch = useDispatch();
	const order = useClassesOrder();

	const reorder = ( newIds: StyleDefinitionID[] ) => {
		dispatch( slice.actions.setOrder( newIds ) );
	};

	return [ order, reorder ] as const;
};

type ClassItemProps = React.PropsWithChildren< {
	id: string;
	label: string;
	renameClass: ( newLabel: string ) => void;
	selected?: boolean;
	disabled?: boolean;
	sortableTriggerProps: SortableTriggerProps;
} >;

const ClassItem = ( { id, label, renameClass, selected, disabled, sortableTriggerProps }: ClassItemProps ) => {
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
const StyledListItemButton = styled( ListItemButton, {
	shouldForwardProp: ( prop: string ) => ! [ 'showActions' ].includes( prop ),
} )< ListItemButtonProps & { showActions: boolean } >(
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

const EmptyState = () => (
	<Stack alignItems="center" gap={ 1.5 } pt={ 10 } px={ 0.5 } maxWidth="260px" margin="auto">
		<FlippedColorSwatchIcon fontSize="large" />
		<StyledHeader variant="subtitle2" component="h2" color="text.secondary">
			{ __( 'There are no global classes yet.', 'elementor' ) }
		</StyledHeader>
		<Typography align="center" variant="caption" color="text.secondary">
			{ __(
				'CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.',
				'elementor'
			) }
		</Typography>
	</Stack>
);

// Override panel reset styles.
const StyledHeader = styled( Typography )< TypographyProps >( ( { theme, variant } ) => ( {
	'&.MuiTypography-root': {
		...( theme.typography[ variant as keyof typeof theme.typography ] as React.CSSProperties ),
	},
} ) );

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
