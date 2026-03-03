import * as React from 'react';
import {
	ControlFormLabel,
	Repeater,
	type RepeaterItem,
	type SetRepeaterValuesMeta,
} from '@elementor/editor-controls';
import {
	updateElementEditorSettings,
	useElementChildren,
	useElementEditorSettings,
	type V1Element,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { getElementByType } from '../get-element-by-type';
import { MENU_ITEM_ELEMENT_TYPE, type MenuItemData, useActions } from './use-actions';

const NAV_ELEMENT_TYPE = 'e-mega-menu-nav';
const CONTENT_AREA_ELEMENT_TYPE = 'e-mega-menu-content-area';

export const MegaMenuControl = ( { label }: { label: string } ) => {
	return (
		<SettingsField bind="default-active-item" propDisplayName={ __( 'Menu Items', 'elementor' ) }>
			<MegaMenuControlContent label={ label } />
		</SettingsField>
	);
};

const MegaMenuControlContent = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();

	const { [ MENU_ITEM_ELEMENT_TYPE ]: menuItems } = useElementChildren( element.id, {
		[ NAV_ELEMENT_TYPE ]: MENU_ITEM_ELEMENT_TYPE,
	} );

	const nav = getElementByType( element.id, NAV_ELEMENT_TYPE ) as V1Element;
	const contentArea = getElementByType( element.id, CONTENT_AREA_ELEMENT_TYPE ) as V1Element;

	const repeaterValues: RepeaterItem< MenuItemData >[] = ( menuItems ?? [] ).map( ( menuItem, index ) => ( {
		id: menuItem.id,
		title: menuItem.editorSettings?.title,
		index,
	} ) );

	const setValue = (
		_newValues: RepeaterItem< MenuItemData >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< MenuItemData > >
	) => {
		if ( ! nav || ! contentArea ) {
			return;
		}

		if ( meta?.action?.type === 'add' ) {
			const items = meta.action.payload;

			return addItem( { contentAreaId: contentArea.id, items, navId: nav.id } );
		}

		if ( meta?.action?.type === 'remove' ) {
			const items = meta.action.payload;

			return removeItem( {
				contentAreaId: contentArea.id,
				items,
			} );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			const items = meta.action.payload;

			return duplicateItem( { contentAreaId: contentArea.id, items } );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;

			return moveItem( {
				contentAreaId: contentArea.id,
				movedElementId: menuItems[ from ].id,
				movedElementIndex: from,
				navId: nav.id,
				toIndex: to,
			} );
		}
	};

	return (
		<Repeater
			itemSettings={ {
				Content: ItemContent,
				Icon: () => null,
				Label: ItemLabel,
				getId: ( { item } ) => item.id,
				initialValues: { id: '', title: 'Menu Item' },
			} }
			label={ label }
			setValues={ setValue }
			showRemove={ repeaterValues.length > 1 }
			showToggle={ false }
			values={ repeaterValues }
		/>
	);
};

const ItemLabel = ( { value }: { value: MenuItemData; index: number } ) => {
	const elementTitle = value?.title;

	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ elementTitle }</span>
		</Stack>
	);
};

const ItemContent = ( { value }: { value: MenuItemData; index: number } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<MenuItemLabelControl elementId={ value.id } />
		</Stack>
	);
};

const MenuItemLabelControl = ( { elementId }: { elementId: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );

	const label = editorSettings?.title ?? '';

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel>{ __( 'Menu Item', 'elementor' ) }</ControlFormLabel>
			<TextField
				size="tiny"
				value={ label }
				onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
					updateElementEditorSettings( {
						elementId,
						settings: { title: target.value },
					} );
				} }
			/>
		</Stack>
	);
};
