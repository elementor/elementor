import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import { updateElementEditorSettings, useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { booleanPropTypeUtil, type CreateOptions } from '@elementor/editor-props';
import { Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { ACCORDION_ELEMENT_TYPE, ACCORDION_ITEM_ELEMENT_TYPE, type AccordionItem, useActions } from './use-actions';
import { useShowIconWriteThrough } from './use-show-icon-write-through';

// An accordion item is self-contained (header and content are nested inside the one
// `e-accordion-item`), so there is no per-item prop on the root the repeater itself needs to bind
// to — but the framework auto-attaches a settings-field indicator (`registerFieldIndicator`,
// FIELD_TYPE.SETTINGS) to every settings field regardless of whether that field's own component
// calls `useBoundProp`; that indicator always calls `useBoundProp` unconditionally and throws
// without a `PropKeyProvider` in its ancestry. Tabs' equivalent repeater wraps in `SettingsField`
// for exactly this reason (bound to `default-active-tab`, a value `TabsControlContent` never
// reads) — mirrored here with `default_state`, an existing root prop unrelated to what the
// repeater actually does, purely to supply the context the indicator needs.
export const AccordionItemsControl = ( { label }: { label: string } ) => {
	return (
		<SettingsField bind="default_state" propDisplayName={ __( 'Accordion Items', 'elementor' ) }>
			<AccordionItemsControlContent label={ label } />
		</SettingsField>
	);
};

const AccordionItemsControlContent = ( { label }: { label: string } ) => {
	const { element, settings } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();

	// Items are direct children of the root, so the root itself is the parent to read them from —
	// there is no menu / content-area indirection as in Tabs.
	const { [ ACCORDION_ITEM_ELEMENT_TYPE ]: items } = useElementChildren(
		element.id,
		{ [ ACCORDION_ELEMENT_TYPE ]: ACCORDION_ITEM_ELEMENT_TYPE },
		{ includeSelfAsParent: true }
	);

	// The root's `show_icon` (rendered elsewhere in this same "Content" section via the standard
	// `Switch_Control` -> `SettingsField` pipeline). Read here, alongside the repeater, purely to
	// drive the write-through to every head - see `useShowIconWriteThrough` for why this can't live
	// inside the generic switch control itself.
	const showIcon = booleanPropTypeUtil.extract( settings.show_icon ) ?? true;

	useShowIconWriteThrough( element.id, showIcon );

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
				showIcon,
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
