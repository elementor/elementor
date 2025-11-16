import * as React from 'react';
import { useEffect, useState } from 'react';
import { type CreateOptions, type PropKey } from '@elementor/editor-props';
import { CopyIcon, EyeIcon, EyeOffIcon, PlusIcon, XIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	IconButton,
	Tooltip,
	type UnstableTagProps,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type SetValueMeta } from '../../bound-prop-context';
import { ControlAdornments } from '../../control-adornments/control-adornments';
import { useSyncExternalState } from '../../hooks/use-sync-external-state';
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

export type ItemActionPayload< T > = Array< { index: number; item: T } >;

type AddItemMeta< T > = {
	type: 'add';
	payload: ItemActionPayload< T >;
};

type RemoveItemMeta< T > = {
	type: 'remove';
	payload: ItemActionPayload< T >;
};

type DuplicateItemMeta< T > = {
	type: 'duplicate';
	payload: ItemActionPayload< T >;
};

type ReorderItemMeta = {
	type: 'reorder';
	payload: { from: number; to: number };
};

export type SetRepeaterValuesMeta< T > =
	| SetValueMeta< AddItemMeta< T > >
	| SetValueMeta< RemoveItemMeta< T > >
	| SetValueMeta< DuplicateItemMeta< T > >
	| SetValueMeta< ReorderItemMeta >;

type RepeaterProps< T > = {
	label: string;
	values?: T[];
	addToBottom?: boolean;
	openOnAdd?: boolean;
	setValues: ( newValue: T[], _: CreateOptions, meta?: SetRepeaterValuesMeta< T > ) => void;
	disabled?: boolean;
	disableAddItemButton?: boolean;
	itemSettings: {
		initialValues: T;
		Label: React.ComponentType< { value: T; index: number } >;
		Icon: React.ComponentType< { value: T } >;
		Content: RepeaterItemContent< T >;
		actions?: React.ReactNode;
	};
	showDuplicate?: boolean;
	showToggle?: boolean;
	isSortable?: boolean;
};

const EMPTY_OPEN_ITEM = -1;

export const Repeater = < T, >( {
	label,
	itemSettings,
	disabled = false,
	openOnAdd = false,
	addToBottom = false,
	values: repeaterValues = [],
	setValues: setRepeaterValues,
	showDuplicate = true,
	showToggle = true,
	isSortable = true,
	disableAddItemButton = false,
}: RepeaterProps< RepeaterItem< T > > ) => {
	const [ openItem, setOpenItem ] = useState( EMPTY_OPEN_ITEM );

	const [ items, setItems ] = useSyncExternalState( {
		external: repeaterValues,
		// @ts-expect-error - as long as persistWhen => true, value will never be null
		setExternal: setRepeaterValues,
		persistWhen: () => true,
	} );

	const [ uniqueKeys, setUniqueKeys ] = useState( items.map( ( _, index ) => index ) );

	const generateNextKey = ( source: number[] ) => {
		return 1 + Math.max( 0, ...source );
	};

	const addRepeaterItem = () => {
		const newItem = structuredClone( itemSettings.initialValues );
		const newKey = generateNextKey( uniqueKeys );

		if ( addToBottom ) {
			setItems( [ ...items, newItem ], undefined, {
				action: { type: 'add', payload: [ { index: items.length, item: newItem } ] },
			} );
			setUniqueKeys( [ ...uniqueKeys, newKey ] );
		} else {
			setItems( [ newItem, ...items ], undefined, {
				action: { type: 'add', payload: [ { index: 0, item: newItem } ] },
			} );
			setUniqueKeys( [ newKey, ...uniqueKeys ] );
		}

		if ( openOnAdd ) {
			setOpenItem( newKey );
		}
	};

	const duplicateRepeaterItem = ( index: number ) => {
		const newItem = structuredClone( items[ index ] );
		const newKey = generateNextKey( uniqueKeys );

		// Insert the new (cloned item) at the next spot (after the current index)
		const atPosition = 1 + index;

		setItems( [ ...items.slice( 0, atPosition ), newItem, ...items.slice( atPosition ) ], undefined, {
			action: { type: 'duplicate', payload: [ { index, item: newItem } ] },
		} );
		setUniqueKeys( [ ...uniqueKeys.slice( 0, atPosition ), newKey, ...uniqueKeys.slice( atPosition ) ] );
	};

	const removeRepeaterItem = ( index: number ) => {
		setUniqueKeys(
			uniqueKeys.filter( ( _, pos ) => {
				return pos !== index;
			} )
		);

		const removedItem = items[ index ];

		setItems(
			items.filter( ( _, pos ) => {
				return pos !== index;
			} ),
			undefined,
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
			undefined,
			{ action: { type: 'toggle-disable' } }
		);
	};

	const onChangeOrder = ( reorderedKeys: number[], meta: { from: number; to: number } ) => {
		setUniqueKeys( reorderedKeys );
		setItems(
			( prevItems ) => {
				return reorderedKeys.map( ( keyValue ) => {
					const index = uniqueKeys.indexOf( keyValue );
					return prevItems[ index ];
				} );
			},
			undefined,
			{ action: { type: 'reorder', payload: { ...meta } } }
		);
	};

	return (
		<SectionContent gap={ 2 }>
			<RepeaterHeader label={ label } adornment={ ControlAdornments }>
				<IconButton
					size={ SIZE }
					sx={ { ml: 'auto' } }
					disabled={ disabled || disableAddItemButton }
					onClick={ addRepeaterItem }
					aria-label={ __( 'Add item', 'elementor' ) }
				>
					<PlusIcon fontSize={ SIZE } />
				</IconButton>
			</RepeaterHeader>
			{ 0 < uniqueKeys.length && (
				<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
					{ uniqueKeys.map( ( key, index ) => {
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
									openOnMount={ openOnAdd && openItem === key }
									onOpen={ () => setOpenItem( EMPTY_OPEN_ITEM ) }
									showDuplicate={ showDuplicate }
									showToggle={ showToggle }
									actions={ itemSettings.actions }
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
	disabled?: boolean;
	actions?: React.ReactNode;
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
	disabled,
	actions,
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
						{ actions }
						<Tooltip title={ removeLabel } placement="top">
							<IconButton size={ SIZE } onClick={ removeItem } aria-label={ removeLabel }>
								<XIcon fontSize={ SIZE } />
							</IconButton>
						</Tooltip>
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
		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ref ] );

	return {
		popoverState,
		ref,
		setRef,
		popoverProps,
	};
};
