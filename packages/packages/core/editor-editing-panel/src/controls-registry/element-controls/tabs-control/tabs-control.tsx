import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import {
	type Element,
	getElementEditorSettings,
	updateElementEditorSettings,
	useElementChildren,
	useElementEditorSettings,
	useElementType,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ElementProvider, useElement } from '../../../contexts/element-context';
import { getElementByType } from '../get-element-by-type';
import { addItem, duplicateItem, moveItem, removeItem, TAB_ELEMENT_TYPE, type TabItem } from './actions';

const TAB_LIST_ELEMENT_TYPE = 'e-tabs-list';
const TAB_CONTENT_ELEMENT_TYPE = 'e-tabs-content';

type ChildElement = {
	type: string;
	target_container_selector: string;
};

export const TabsControl = ( { childElements }: { childElements: ChildElement[] } ) => {
	const { element } = useElement();

	const { [ TAB_ELEMENT_TYPE ]: tabLinks } = useElementChildren(
		element.id,
		childElements.map( ( child ) => child.type )
	);

	const tabList = getElementByType( element.id, TAB_LIST_ELEMENT_TYPE );
	const tabContent = getElementByType( element.id, TAB_CONTENT_ELEMENT_TYPE );

	const repeaterValues: RepeaterItem< TabItem >[] = tabLinks.map( ( tabLink ) => {
		const { title: titleSetting } = getElementEditorSettings( tabLink.id ) ?? {};

		return {
			id: tabLink.id,
			title: titleSetting,
		};
	} );

	const setValue = (
		_newValues: RepeaterItem< TabItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< TabItem > >
	) => {
		if ( meta?.action?.type === 'add' ) {
			const items = meta.action.payload;

			return addItem( { tabContentId: tabContent.id, items, tabListId: tabList.id } );
		}

		if ( meta?.action?.type === 'remove' ) {
			const items = meta.action.payload;

			return removeItem( { items } );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			const items = meta.action.payload;

			return duplicateItem( { items } );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;

			return moveItem( {
				toIndex: to,
				tabListId: tabList.id,
				tabContentId: tabContent.id,
				movedElementId: tabLinks[ from ].id,
			} );
		}
	};

	return (
		<Repeater
			addToBottom
			showToggle={ false }
			openOnAdd={ false }
			values={ repeaterValues }
			setValues={ setValue }
			label={ __( 'Tabs', 'elementor' ) }
			itemSettings={ {
				initialValues: { title: 'Tab' },
				Label: ( props ) => (
					<ElementItem { ...props }>
						<ItemLabel value={ props.value } />
					</ElementItem>
				),
				Content: ( props ) => (
					<ElementItem { ...props }>
						<ItemContent />
					</ElementItem>
				),
				Icon: () => null,
			} }
		/>
	);
};

const ItemLabel = ( { value }: { value: TabItem } ) => {
	const id = value.id ?? '';

	const editorSettings = useElementEditorSettings( id );

	const elementTitle = editorSettings?.title;

	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center">
			<span>{ elementTitle }</span>
		</Stack>
	);
};

const ItemContent = () => {
	const { element } = useElement();

	const editorSettings = useElementEditorSettings( element.id );

	const label = editorSettings?.title ?? '';

	return (
		<Stack p={ 2 }>
			<ControlFormLabel sx={ { mb: 1 } }>{ __( 'Tab name', 'elementor' ) }</ControlFormLabel>
			<TextField
				value={ label }
				size="tiny"
				onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
					updateElementEditorSettings( {
						elementId: element.id,
						settings: { title: target.value },
					} );
				} }
			/>
		</Stack>
	);
};

const ElementItem = ( { children, value }: { children: React.ReactNode; value: TabItem } ) => {
	const elementType = useElementType( TAB_ELEMENT_TYPE );

	if ( ! elementType ) {
		return null;
	}

	const element: Element = {
		id: value.id ?? '',
		type: elementType.key,
	};

	return (
		<ElementProvider element={ element } elementType={ elementType }>
			{ children }
		</ElementProvider>
	);
};
