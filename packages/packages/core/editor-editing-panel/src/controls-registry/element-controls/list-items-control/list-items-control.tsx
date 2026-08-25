import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import { updateElementEditorSettings, useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { addItem, duplicateItem, LIST_ITEM_ELEMENT_TYPE, type ListItem, moveItem, removeItem } from './list-actions';

const LIST_ELEMENT_TYPE = 'e-list';

const getEffectiveListItemLabel = ( label: string | undefined, fallbackLabel: string ) => {
	return label?.trim() ? label : fallbackLabel;
};

const getDefaultListItemLabel = ( index: number ) => {
	return `Item ${ index + 1 }`;
};

export const ListItemsControl = ( { label }: { label: string } ) => {
	return (
		<SettingsField bind="tag" propDisplayName={ __( 'List', 'elementor' ) }>
			<ListItemsControlContent label={ label } />
		</SettingsField>
	);
};

const ListItemsControlContent = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { [ LIST_ITEM_ELEMENT_TYPE ]: listItems } = useElementChildren(
		element.id,
		{ [ LIST_ELEMENT_TYPE ]: LIST_ITEM_ELEMENT_TYPE },
		{ includeSelfAsParent: true }
	);

	const repeaterValues: RepeaterItem< ListItem >[] = listItems.map( ( item, index ) => ( {
		id: item.id,
		title: getDefaultListItemLabel( index ),
		index,
	} ) );

	const setValue = (
		_newValues: RepeaterItem< ListItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< ListItem > >
	) => {
		if ( meta?.action?.type === 'add' ) {
			return addItem( { listContainerId: element.id, items: meta.action.payload } );
		}

		if ( meta?.action?.type === 'remove' ) {
			return removeItem( { items: meta.action.payload } );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			return duplicateItem( { items: meta.action.payload } );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;

			return moveItem( {
				toIndex: to,
				listContainerId: element.id,
				movedElementId: listItems[ from ].id,
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
			itemSettings={ {
				getId: ( { item } ) => item.id,
				initialValues: { id: '', title: 'Item' },
				Label: ItemLabel,
				Content: ItemContent,
				Icon: () => null,
			} }
		/>
	);
};

const ItemLabel = ( { value, index }: { value: ListItem; index: number } ) => {
	const fallbackLabel = value.title ?? getDefaultListItemLabel( index );

	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			{ value.id ? (
				<ListItemRepeaterLabel elementId={ value.id } fallbackLabel={ fallbackLabel } />
			) : (
				<span>{ fallbackLabel }</span>
			) }
		</Stack>
	);
};

const ItemContent = ( { value }: { value: ListItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<ListItemLabelControl elementId={ value.id } fallbackLabel={ value.title ?? '' } />
		</Stack>
	);
};

const ListItemRepeaterLabel = ( { elementId, fallbackLabel }: { elementId: string; fallbackLabel: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );
	const label = getEffectiveListItemLabel( editorSettings?.title, fallbackLabel );

	return <span>{ label }</span>;
};

const ListItemLabelControl = ( { elementId, fallbackLabel }: { elementId: string; fallbackLabel: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );
	const label = getEffectiveListItemLabel( editorSettings?.title, fallbackLabel );

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel>{ __( 'Item name', 'elementor' ) }</ControlFormLabel>
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
