import * as React from 'react';
import { useId } from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import {
	type Control,
	type ControlItem,
	getElementType,
	updateElementEditorSettings,
	useElementChildren,
	useElementEditorSettings,
	type V1Element,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { SettingsControl } from '../../../components/settings-control';
import { ElementProvider, useElement } from '../../../contexts/element-context';
import { getElementByType } from '../get-element-by-type';
import {
	MENU_ENTRY_ELEMENT_TYPE,
	MENU_ITEM_ELEMENT_TYPE,
	MENU_ITEMS_ELEMENT_TYPE,
	type MenuItem,
	useActions,
} from './use-actions';
import { useEntryItem } from './use-entry-item';

const LINK_BIND = 'link';

export const MenuItemsControl = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();

	const { [ MENU_ENTRY_ELEMENT_TYPE ]: entries } = useElementChildren( element.id, {
		[ MENU_ITEMS_ELEMENT_TYPE ]: MENU_ENTRY_ELEMENT_TYPE,
	} );

	const menuItems = getElementByType( element.id, MENU_ITEMS_ELEMENT_TYPE ) as V1Element | null;

	const repeaterValues: RepeaterItem< MenuItem >[] = entries.map( ( entry, index ) => ( {
		id: entry.id,
		title: entry.editorSettings?.title,
		index,
	} ) );

	const setValue = (
		_newValues: RepeaterItem< MenuItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< MenuItem > >
	) => {
		if ( ! menuItems ) {
			return;
		}

		if ( meta?.action?.type === 'add' ) {
			return addItem( {
				menuItemsId: menuItems.id,
				items: meta.action.payload,
			} );
		}

		if ( meta?.action?.type === 'remove' ) {
			return removeItem( { menuItemsId: menuItems.id, items: meta.action.payload } );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			return duplicateItem( { items: meta.action.payload } );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;

			return moveItem( {
				menuItemsId: menuItems.id,
				movedElementId: entries[ from ].id,
				toIndex: to,
			} );
		}
	};

	return (
		<Repeater
			showToggle={ false }
			values={ repeaterValues }
			setValues={ setValue }
			showRemove={ repeaterValues.length > 1 }
			label={ label }
			adornment={ () => null }
			itemSettings={ {
				getId: ( { item } ) => item.id,
				initialValues: { id: '', title: __( 'Menu item', 'elementor' ) },
				Label: ItemLabel,
				Content: ItemContent,
				Icon: () => null,
			} }
		/>
	);
};

const ItemLabel = ( { value }: { value: MenuItem } ) => (
	<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
		{ value.id ? <EntryLabel elementId={ value.id } fallbackTitle={ value.title } /> : <span>{ value?.title }</span> }
	</Stack>
);

const EntryLabel = ( { elementId, fallbackTitle }: { elementId: string; fallbackTitle?: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );

	return <span>{ editorSettings?.title ?? fallbackTitle ?? '' }</span>;
};

const ItemContent = ( { value }: { value: MenuItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<ItemNameControl elementId={ value.id } />
			<ItemLinkControl entryId={ value.id } />
		</Stack>
	);
};

const ItemNameControl = ( { elementId }: { elementId: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );
	const inputId = useId();

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel htmlFor={ inputId }>{ __( 'Item name', 'elementor' ) }</ControlFormLabel>
			<TextField
				id={ inputId }
				size="tiny"
				value={ editorSettings?.title ?? '' }
				onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
					updateElementEditorSettings( { elementId, settings: { title: target.value } } );
				} }
			/>
		</Stack>
	);
};

const ItemLinkControl = ( { entryId }: { entryId: string } ) => {
	const { itemId, settings } = useEntryItem( entryId );
	const elementType = itemId ? getElementType( MENU_ITEM_ELEMENT_TYPE ) : null;
	const linkControl = elementType ? findControlByBind( elementType.controls, LINK_BIND ) : null;

	if ( ! itemId || ! elementType || ! linkControl ) {
		return null;
	}

	return (
		<ElementProvider
			element={ { id: itemId, type: MENU_ITEM_ELEMENT_TYPE } }
			elementType={ elementType }
			settings={ settings }
		>
			<SettingsControl control={ linkControl } />
		</ElementProvider>
	);
};

const findControlByBind = ( items: ControlItem[], bind: string ): Control | null => {
	for ( const item of items ) {
		if ( item.type === 'section' ) {
			const found = findControlByBind( item.value.items, bind );

			if ( found ) {
				return found;
			}
		}

		if ( item.type === 'control' && item.value.bind === bind ) {
			return item;
		}
	}

	return null;
};
