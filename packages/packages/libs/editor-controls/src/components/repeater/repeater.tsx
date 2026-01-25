import * as React from 'react';
import { useEffect, useState } from 'react';
import { type CreateOptions, type PropKey } from '@elementor/editor-props';
import { CopyIcon, EyeIcon, EyeOffIcon, PlusIcon, XIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	IconButton,
	Infotip,
	Tooltip,
	type UnstableTagProps,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type SetValueMeta } from '../../bound-prop-context';
import { ControlAdornments } from '../../control-adornments/control-adornments';
import { RepeaterItemIconSlot, RepeaterItemLabelSlot } from '../control-repeater/locations';
import { SectionContent } from '../section-content';
import { RepeaterHeader } from './repeater-header';
import { RepeaterPopover } from './repeater-popover';
import { RepeaterTag } from './repeater-tag';
import { SortableItem, SortableProvider } from './sortable';

const SIZE = 'tiny';

type AnchorEl = HTMLElement | null;

export type RepeaterItem< T > = {
	disabled?: boolean;
} & T;

type RepeaterItemContentProps< T > = {
	anchorEl: AnchorEl;
	bind: PropKey;
	value: T;
	index: number;
};

type RepeaterItemContent< T > = React.ComponentType< RepeaterItemContentProps< T > >;

export type ItemsActionPayload< T > = Array< { index: number; item: T } >;

type AddItemMeta< T > = {
	type: 'add';
	payload: ItemsActionPayload< T >;
};

type RemoveItemMeta< T > = {
	type: 'remove';
	payload: ItemsActionPayload< T >;
};

type DuplicateItemMeta< T > = {
	type: 'duplicate';
	payload: ItemsActionPayload< T >;
};

type ReorderItemMeta = {
	type: 'reorder';
	payload: { from: number; to: number };
};

type ToggleDisableItemMeta = {
	type: 'toggle-disable';
};

export type SetRepeaterValuesMeta< T > =
	| SetValueMeta< AddItemMeta< T > >
	| SetValueMeta< RemoveItemMeta< T > >
	| SetValueMeta< DuplicateItemMeta< T > >
	| SetValueMeta< ReorderItemMeta >
	| SetValueMeta< ToggleDisableItemMeta >;

type BaseItemSettings< T > = {
	initialValues: T;
	Label: React.ComponentType< { value: T; index: number } >;
	Icon: React.ComponentType< { value: T } >;
	Content: RepeaterItemContent< T >;
	actions?: ( value: T ) => React.ReactNode;
};

type SortableItemSettings< T > = BaseItemSettings< T > & {
	getId: ( { item, index }: { item: T; index: number } ) => string;
};

type RepeaterProps< T > =
	| {
			label: string;
			values?: T[];
			openOnAdd?: boolean;
			setValues: ( newValue: T[], _: CreateOptions, meta?: SetRepeaterValuesMeta< T > ) => void;
			disabled?: boolean;
			disableAddItemButton?: boolean;
			addButtonInfotipContent?: React.ReactNode;
			showDuplicate?: boolean;
			showToggle?: boolean;
			showRemove?: boolean;
			openItem?: number;
			isSortable: false;
			itemSettings: BaseItemSettings< T >;
	  }
	| {
			label: string;
			values?: T[];
			openOnAdd?: boolean;
			setValues: ( newValue: T[], _: CreateOptions, meta?: SetRepeaterValuesMeta< T > ) => void;
			disabled?: boolean;
			disableAddItemButton?: boolean;
			addButtonInfotipContent?: React.ReactNode;
			showDuplicate?: boolean;
			showToggle?: boolean;
			showRemove?: boolean;
			openItem?: number;
			isSortable?: true;
			itemSettings: SortableItemSettings< T >;
	  };

const EMPTY_OPEN_ITEM = -1;

export const Repeater = < T, >( {
	label,
	itemSettings,
	disabled = false,
	openOnAdd = false,
	values: items = [],
	setValues: setItems,
	showDuplicate = true,
	showToggle = true,
	showRemove = true,
	disableAddItemButton = false,
	addButtonInfotipContent,
	openItem: initialOpenItem = EMPTY_OPEN_ITEM,
	isSortable = true,
}: RepeaterProps< RepeaterItem< T > > ) => {
	const [ openItem, setOpenItem ] = useState( initialOpenItem );

	const uniqueKeys = items.map( ( item, index ) =>
		isSortable && 'getId' in itemSettings ? itemSettings.getId( { item, index } ) : String( index )
	);

	const addRepeaterItem = () => {
		const newItem = structuredClone( itemSettings.initialValues );
		const newIndex = items.length;
		setItems(
			[ ...items, newItem ],
			{},
			{
				action: { type: 'add', payload: [ { index: newIndex, item: newItem } ] },
			}
		);

		if ( openOnAdd ) {
			setOpenItem( newIndex );
		}
	};

	const duplicateRepeaterItem = ( index: number ) => {
		const newItem = structuredClone( items[ index ] );

		// Insert the new (cloned item) at the next spot (after the current index)
		const atPosition = 1 + index;

		setItems(
			[ ...items.slice( 0, atPosition ), newItem, ...items.slice( atPosition ) ],
			{},
			{
				action: { type: 'duplicate', payload: [ { index, item: newItem } ] },
			}
		);
	};

	const removeRepeaterItem = ( index: number ) => {
		const removedItem = items[ index ];

		setItems(
			items.filter( ( _, pos ) => {
				return pos !== index;
			} ),
			{},
			{ action: { type: 'remove', payload: [ { index, item: removedItem } ] } }
		);
	};

	const toggleDisableRepeaterItem = ( index: number ) => {
		setItems(
			items.map( ( value, pos ) => {
				if ( pos === index ) {
					const { disabled: propDisabled, ...rest } = value;

					// If the items should not be disabled, remove the disabled property.
					return { ...rest, ...( propDisabled ? {} : { disabled: true } ) } as RepeaterItem< T >;
				}

				return value;
			} ),
			{},
			{ action: { type: 'toggle-disable' } }
		);
	};

	const onChangeOrder = ( reorderedKeys: string[], meta: { from: number; to: number } ) => {
		setItems(
			reorderedKeys.map( ( id ) => {
				return items[ uniqueKeys.indexOf( id ) ];
			} ),
			{},
			{ action: { type: 'reorder', payload: { ...meta } } }
		);
	};

	const isButtonDisabled = disabled || disableAddItemButton;
	const shouldShowInfotip = isButtonDisabled && addButtonInfotipContent;

	const addButton = (
		<IconButton
			size={ SIZE }
			sx={ {
				ml: 'auto',
			} }
			disabled={ isButtonDisabled }
			onClick={ addRepeaterItem }
			aria-label={ __( 'Add item', 'elementor' ) }
		>
			<PlusIcon fontSize={ SIZE } />
		</IconButton>
	);

	return (
		<SectionContent gap={ 2 }>
			<RepeaterHeader label={ label } adornment={ ControlAdornments }>
				{ shouldShowInfotip ? (
					<Infotip
						placement="right"
						content={ addButtonInfotipContent }
						color="secondary"
						slotProps={ { popper: { sx: { width: 300 } } } }
					>
						<Box sx={ { ...( isButtonDisabled ? { cursor: 'not-allowed' } : {} ) } }>{ addButton }</Box>
					</Infotip>
				) : (
					addButton
				) }
			</RepeaterHeader>
			{ 0 < uniqueKeys.length && (
				<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
					{ uniqueKeys.map( ( key ) => {
						const index = uniqueKeys.indexOf( key );
						const value = items[ index ];

						if ( ! value ) {
							return null;
						}

						return (
							<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
								<RepeaterItem
									disabled={ disabled }
									propDisabled={ value?.disabled }
									label={
										<RepeaterItemLabelSlot value={ value }>
											<itemSettings.Label value={ value } index={ index } />
										</RepeaterItemLabelSlot>
									}
									startIcon={
										<RepeaterItemIconSlot value={ value }>
											<itemSettings.Icon value={ value } />
										</RepeaterItemIconSlot>
									}
									removeItem={ () => removeRepeaterItem( index ) }
									duplicateItem={ () => duplicateRepeaterItem( index ) }
									toggleDisableItem={ () => toggleDisableRepeaterItem( index ) }
									openOnMount={ openOnAdd && openItem === index }
									onOpen={ () => setOpenItem( EMPTY_OPEN_ITEM ) }
									showDuplicate={ showDuplicate }
									showToggle={ showToggle }
									showRemove={ showRemove }
									actions={ itemSettings.actions }
									value={ value }
								>
									{ ( props ) => (
										<itemSettings.Content
											{ ...props }
											value={ value }
											bind={ String( index ) }
											index={ index }
										/>
									) }
								</RepeaterItem>
							</SortableItem>
						);
					} ) }
				</SortableProvider>
			) }
		</SectionContent>
	);
};

type RepeaterItemProps< T > = {
	label: React.ReactNode;
	propDisabled?: boolean;
	startIcon: UnstableTagProps[ 'startIcon' ];
	removeItem: () => void;
	duplicateItem: () => void;
	toggleDisableItem: () => void;
	children: ( props: Pick< RepeaterItemContentProps< T >, 'anchorEl' > ) => React.ReactNode;
	openOnMount: boolean;
	onOpen: () => void;
	showDuplicate: boolean;
	showToggle: boolean;
	showRemove: boolean;
	disabled?: boolean;
	actions?: ( value: T ) => React.ReactNode;
	value: T;
};

const RepeaterItem = < T, >( {
	label,
	propDisabled,
	startIcon,
	children,
	removeItem,
	duplicateItem,
	toggleDisableItem,
	openOnMount,
	onOpen,
	showDuplicate,
	showToggle,
	showRemove,
	disabled,
	actions,
	value,
}: RepeaterItemProps< T > ) => {
	const { popoverState, popoverProps, ref, setRef } = usePopover( openOnMount, onOpen );

	const duplicateLabel = __( 'Duplicate', 'elementor' );
	const toggleLabel = propDisabled ? __( 'Show', 'elementor' ) : __( 'Hide', 'elementor' );
	const removeLabel = __( 'Remove', 'elementor' );

	return (
		<>
			<RepeaterTag
				disabled={ disabled }
				label={ label }
				ref={ setRef }
				aria-label={ __( 'Open item', 'elementor' ) }
				{ ...bindTrigger( popoverState ) }
				startIcon={ startIcon }
				actions={
					<>
						{ showDuplicate && (
							<Tooltip title={ duplicateLabel } placement="top">
								<IconButton size={ SIZE } onClick={ duplicateItem } aria-label={ duplicateLabel }>
									<CopyIcon fontSize={ SIZE } />
								</IconButton>
							</Tooltip>
						) }
						{ showToggle && (
							<Tooltip title={ toggleLabel } placement="top">
								<IconButton size={ SIZE } onClick={ toggleDisableItem } aria-label={ toggleLabel }>
									{ propDisabled ? <EyeOffIcon fontSize={ SIZE } /> : <EyeIcon fontSize={ SIZE } /> }
								</IconButton>
							</Tooltip>
						) }
						{ actions?.( value ) }
						{ showRemove && (
							<Tooltip title={ removeLabel } placement="top">
								<IconButton size={ SIZE } onClick={ removeItem } aria-label={ removeLabel }>
									<XIcon fontSize={ SIZE } />
								</IconButton>
							</Tooltip>
						) }
					</>
				}
			/>
			<RepeaterPopover width={ ref?.getBoundingClientRect().width } { ...popoverProps } anchorEl={ ref }>
				<Box>{ children( { anchorEl: ref } ) }</Box>
			</RepeaterPopover>
		</>
	);
};

const usePopover = ( openOnMount: boolean, onOpen: () => void ) => {
	const [ ref, setRef ] = useState< HTMLElement | null >( null );

	const popoverState = usePopupState( { variant: 'popover' } );

	const popoverProps = bindPopover( popoverState );

	useEffect( () => {
		if ( openOnMount && ref ) {
			popoverState.open( ref );
			onOpen?.();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ref ] );

	return {
		popoverState,
		ref,
		setRef,
		popoverProps,
	};
};
