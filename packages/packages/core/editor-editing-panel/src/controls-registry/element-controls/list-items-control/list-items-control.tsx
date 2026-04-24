import * as React from 'react';
import {
	ControlFormLabel,
	Repeater,
	type RepeaterItem,
	type SetRepeaterValuesMeta,
} from '@elementor/editor-controls';
import {
	createElements,
	type CreateElementParams,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
	updateElementEditorSettings,
	useElementEditorSettings,
	type V1Element,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';

const LIST_ITEM_ELEMENT_TYPE = 'e-list-item';

type ListItem = {
	id: string;
	title?: string;
};

export const ListItemsControl = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const listItems = useListItems( element.id );

	const repeaterValues: RepeaterItem< ListItem >[] = listItems.map( ( item, index ) => ( {
		id: item.id,
		title: item.editorSettings?.title,
		index,
	} ) );

	const setValue = (
		_newValues: RepeaterItem< ListItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< ListItem > >
	) => {
		if ( meta?.action?.type === 'add' ) {
			meta.action.payload.forEach( ( { index } ) => addItem( element.id, index ) );
		}

		if ( meta?.action?.type === 'remove' ) {
			removeElements( {
				title: __( 'List Items', 'elementor' ),
				elementIds: meta.action.payload.map( ( { item } ) => item.id ),
			} );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			meta.action.payload.forEach( ( { item } ) => {
				duplicateElements( {
					title: __( 'Duplicate List Item', 'elementor' ),
					elementIds: [ item.id ],
				} );
			} );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;
			const movedElement = getContainer( listItems[ from ]?.id );
			const targetContainer = getContainer( element.id );

			if ( movedElement && targetContainer ) {
				moveElements( {
					title: __( 'Reorder List Items', 'elementor' ),
					moves: [
						{
							element: movedElement,
							targetContainer,
							options: { at: to },
						},
					],
				} );
			}
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
				initialValues: { id: '', title: __( 'Item', 'elementor' ) },
				Label: ItemLabel,
				Content: ItemContent,
				Icon: () => null,
			} }
		/>
	);
};

function useListItems( elementId: string ) {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/update' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const container = getContainer( elementId );

			return ( container?.children ?? [] )
				.filter( ( child: V1Element ) => child.model.get( 'elType' ) === LIST_ITEM_ELEMENT_TYPE )
				.map( ( child: V1Element ) => ( {
					id: child.id,
					editorSettings: child.model.get( 'editor_settings' ) ?? {},
				} ) );
		},
		[ elementId ]
	);
}

function addItem( elementId: string, index: number ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	const position = index + 1;

	createElements( {
		title: __( 'List Items', 'elementor' ),
		elements: [
			{
				container,
				model: createListItemModel( position ),
				options: { at: index },
			},
		],
	} );
}

function createListItemModel( position: number ): CreateElementParams[ 'model' ] {
	const paragraph = `Item #${ position }`;
	const paragraphChild = {
		elType: 'widget',
		widgetType: 'e-paragraph',
		settings: {
			paragraph: {
				$$type: 'html-v3',
				value: {
					content: {
						$$type: 'string',
						value: paragraph,
					},
					children: [],
				},
			},
			tag: {
				$$type: 'string',
				value: 'span',
			},
		},
	};

	return {
		elType: LIST_ITEM_ELEMENT_TYPE,
		isLocked: true,
		editor_settings: {
			title: paragraph,
			initial_position: position,
		},
		elements: [ paragraphChild ] as unknown as V1ElementModelProps[ 'elements' ],
	};
}

const ItemLabel = ( { value }: { value: ListItem } ) => {
	const editorSettings = useElementEditorSettings( value.id );

	return <span>{ editorSettings?.title || value?.title || __( 'Item', 'elementor' ) }</span>;
};

const ItemContent = ( { value }: { value: ListItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1 }>
			<ListItemTitleControl elementId={ value.id } />
		</Stack>
	);
};

const ListItemTitleControl = ( { elementId }: { elementId: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );
	const title = editorSettings?.title ?? '';

	return (
		<>
			<ControlFormLabel>{ __( 'Item name', 'elementor' ) }</ControlFormLabel>
			<TextField
				size="tiny"
				value={ title }
				onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
					updateElementEditorSettings( {
						elementId,
						settings: { title: target.value },
					} );
				} }
			/>
		</>
	);
};
