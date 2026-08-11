import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import {
	getContainer,
	getElementChildrenWithFallback,
	updateElementEditorSettings,
	useElementEditorSettings,
	type V1Element,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import {
	__privateUseListenTo as useListenTo,
	commandEndEvent,
	v1ReadyEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { LIST_ITEM_ELEMENT_TYPE, type ListItem, useActions } from './use-actions';

type ElementModel = {
	id: string;
	editorSettings: {
		label?: string;
		title?: string;
	};
};

const useListItems = ( elementId: string ): ElementModel[] => {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/update' ),
			commandEndEvent( 'document/elements/set-settings' ),
			windowEvent( 'elementor/element/update_editor_settings' ),
		],
		() => {
			const container = getContainer( elementId );
			const model = container?.model;

			if ( ! model ) {
				return [];
			}

			return getElementChildrenWithFallback(
				model,
				( childModel ) => childModel.get( 'elType' ) === LIST_ITEM_ELEMENT_TYPE
			).map( ( { model: childModel } ) => ( {
				id: childModel.get( 'id' ) as string,
				editorSettings: ( childModel.get( 'editor_settings' ) ?? {} ) as ElementModel[ 'editorSettings' ],
			} ) );
		},
		[ elementId ]
	);
};

export const ListItemsControl = ( { label }: { label: string } ) => {
	return <ListItemsControlContent label={ label } />;
};

export const ListItemsControlContent = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();
	const listItems = useListItems( element.id );
	const listContainer = getContainer( element.id ) as V1Element;

	const repeaterValues: RepeaterItem< ListItem >[] = listItems.map( ( item, index ) => ( {
		id: item.id,
		title: item.editorSettings.label ?? `Item ${ index + 1 }`,
		index,
	} ) );

	const setValue = (
		_newValues: RepeaterItem< ListItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< ListItem > >
	) => {
		if ( ! listContainer ) {
			throw new Error( 'List container not found' );
		}

		if ( meta?.action?.type === 'add' ) {
			return addItem( { items: meta.action.payload, listContainer } );
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
				listContainer,
				toIndex: to,
				movedElementId: listItems[ from ]?.id,
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

const ItemLabel = ( { value }: { value: ListItem } ) => {
	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ value.title }</span>
		</Stack>
	);
};

const ItemContent = ( { value }: { value: ListItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<ListItemLabelControl elementId={ value.id } initialLabel={ value.title ?? '' } />
		</Stack>
	);
};

const ListItemLabelControl = ( { elementId, initialLabel }: { elementId: string; initialLabel: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );
	const label = editorSettings?.label ?? initialLabel;

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel>{ __( 'Item name', 'elementor' ) }</ControlFormLabel>
			<TextField
				size="tiny"
				value={ label }
				onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
					updateElementEditorSettings( {
						elementId,
						settings: { label: target.value },
					} );
				} }
			/>
		</Stack>
	);
};
