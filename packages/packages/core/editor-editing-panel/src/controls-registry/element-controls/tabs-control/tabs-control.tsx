import * as React from 'react';
import { ControlFormLabel, Repeater, type RepeaterItem, type SetRepeaterValuesMeta } from '@elementor/editor-controls';
import {
	type Element,
	getElementEditorSettings,
	updateElementEditorSettings,
	useElementEditorSettings,
	useElementType,
} from '@elementor/editor-elements';
import { type CreateOptions } from '@elementor/editor-props';
import { EditableField, useEditable } from '@elementor/editor-ui';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ElementProvider, useElement } from '../../../contexts/element-context';
import { useElementsField } from '../../elements-field';
import { useChildContainers } from '../ues-child-containers';
import {
	addItem,
	duplicateItem,
	moveItem,
	removeItem,
	TAB_ELEMENT_TYPE,
	TAB_PANEL_ELEMENT_TYPE,
	type TabsPropValue,
} from './actions';

export const TabsControl = () => {
	const { values } = useElementsField();
	const { tabList, tabContent } = useChildContainers( {
		tabList: TAB_ELEMENT_TYPE,
		tabContent: TAB_PANEL_ELEMENT_TYPE,
	} );

	const tabLinks = values[ TAB_ELEMENT_TYPE ] ?? [];

	const repeaterValues: RepeaterItem< TabsPropValue >[] = tabLinks.map( ( tabLink ) => {
		const { title: titleSetting } = getElementEditorSettings( tabLink.id ) ?? {};

		return {
			id: tabLink.id,
			title: titleSetting,
		};
	} );

	const setValue = (
		_newValues: RepeaterItem< TabsPropValue >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< TabsPropValue > >
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

			return moveItem( { from, to, tabListId: tabList.id, tabContentId: tabContent.id, tabLinks } );
		}
	};

	return (
		<Repeater
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

const ItemLabel = ( { value }: { value: TabsPropValue } ) => {
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

	const {
		ref,
		openEditMode,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: label,
		onSubmit: ( newValue ) => {
			updateElementEditorSettings( {
				elementId: element.id,
				settings: {
					title: newValue,
				},
			} );
		},
	} );

	return (
		<Stack p={ 2 }>
			<ControlFormLabel sx={ { mb: 1 } }>{ __( 'Tab name', 'elementor' ) }</ControlFormLabel>
			<Stack
				onClick={ openEditMode }
				justifyContent="center"
				sx={ {
					mb: 1.5,
					width: '100%',
					height: 28,
					borderRadius: 1,
					border: '1px solid',
					borderColor: 'divider',
					px: 1,
				} }
			>
				<EditableField { ...getEditableProps() } value={ label } error={ error } ref={ ref } />
			</Stack>
		</Stack>
	);
};

const ElementItem = ( { children, value }: { children: React.ReactNode; value: TabsPropValue } ) => {
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
