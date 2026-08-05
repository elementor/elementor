import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import { updateElementEditorSettings, useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { ACCORDION_ELEMENT_TYPE, ACCORDION_ITEM_ELEMENT_TYPE, type AccordionItem, useActions } from './use-actions';

// Unlike the Tabs control there is no `SettingsField` / `useBoundProp` wrapper here: an accordion
// item is self-contained (head and content are nested inside the one `e-accordion-item`), so there
// is no per-item prop on the root to bind to. `Repeater` reads no bound prop of its own — its only
// context dependency is `ControlAdornmentsProvider`, which `SettingsControl` already provides for
// element controls and which falls back to no adornments when absent.
export const AccordionItemsControl = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();

	// Items are direct children of the root, so the root itself is the parent to read them from —
	// there is no menu / content-area indirection as in Tabs.
	const { [ ACCORDION_ITEM_ELEMENT_TYPE ]: items } = useElementChildren(
		element.id,
		{ [ ACCORDION_ELEMENT_TYPE ]: ACCORDION_ITEM_ELEMENT_TYPE },
		{ includeSelfAsParent: true }
	);

	const repeaterValues: RepeaterItem< AccordionItem >[] = items.map( ( item, index ) => {
		return {
			id: item.id,
			title: item.editorSettings?.title,
			index,
		};
	} );

	const setValue = (
		_newValues: RepeaterItem< AccordionItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< AccordionItem > >
	) => {
		if ( meta?.action?.type === 'add' ) {
			return addItem( {
				accordionId: element.id,
				// The new item's number comes from the titles already in use, not from the item count -
				// see `getNextItemNumber`.
				existingTitles: repeaterValues.map( ( { title } ) => title ),
				items: meta.action.payload,
			} );
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
				accordionId: element.id,
				movedElementId: items[ from ].id,
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
			itemSettings={ {
				getId: ( { item } ) => item.id,
				initialValues: { id: '', title: __( 'Accordion Item', 'elementor' ) },
				Label: ItemLabel,
				Content: ItemContent,
				Icon: () => null,
			} }
		/>
	);
};

const ItemLabel = ( { value }: { value: AccordionItem } ) => {
	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ value?.title }</span>
		</Stack>
	);
};

const ItemContent = ( { value }: { value: AccordionItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<ItemNameControl elementId={ value.id } />
		</Stack>
	);
};

const ItemNameControl = ( { elementId }: { elementId: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );

	const label = editorSettings?.title ?? '';

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel>{ __( 'Name', 'elementor' ) }</ControlFormLabel>
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
