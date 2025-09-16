import * as React from 'react';
import {
	ControlFormLabel,
	Repeater,
	type RepeaterItem,
	type SetRepeaterValuesMeta,
	useBoundProp,
} from '@elementor/editor-controls';
import {
	type Element,
	getElementEditorSettings,
	getElementType,
	updateElementEditorSettings,
	useElementChildren,
	useElementEditorSettings,
} from '@elementor/editor-elements';
import { type CreateOptions, stringPropTypeUtil } from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, Chip, Infotip, type InfotipProps, Stack, Switch, TextField, Typography } from '@elementor/ui';
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
	const { value: defaultItem } = useBoundProp( stringPropTypeUtil );

	const isDefault = defaultItem === id;

	const editorSettings = useElementEditorSettings( id );

	const elementTitle = editorSettings?.title;

	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ elementTitle }</span>
			{ isDefault && <Chip size="tiny" shape="rounded" label={ __( 'Default', 'elementor' ) } /> }
		</Stack>
	);
};

const ItemContent = () => {
	const { element } = useElement();

	const editorSettings = useElementEditorSettings( element.id );

	const label = editorSettings?.title ?? '';

	const { value: defaultItem, setValue: setDefaultItem } = useBoundProp( stringPropTypeUtil );

	const isDefault = defaultItem === element.id;

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<Stack gap={ 1 }>
				<ControlFormLabel>{ __( 'Tab name', 'elementor' ) }</ControlFormLabel>
				<TextField
					size="tiny"
					value={ label }
					onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
						updateElementEditorSettings( {
							elementId: element.id,
							settings: { title: target.value },
						} );
					} }
				/>
			</Stack>
			<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
				<ControlFormLabel>{ __( 'Set as default tab', 'elementor' ) }</ControlFormLabel>
				<ConditionalTooltip showTooltip={ isDefault } content={ tooltipContent } placement="right">
					<Switch
						size="small"
						checked={ isDefault }
						disabled={ isDefault }
						onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
							setDefaultItem( target.checked ? element.id : null );
						} }
						inputProps={ {
							...( isDefault ? { style: { opacity: 0, cursor: 'not-allowed' } } : {} ),
						} }
					/>
				</ConditionalTooltip>
			</Stack>
		</Stack>
	);
};

const ElementItem = ( { children, value }: { children: React.ReactNode; value: TabItem } ) => {
	const elementType = getElementType( TAB_ELEMENT_TYPE );

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

const tooltipContent = (
	<Alert color="secondary" icon={ <InfoCircleFilledIcon fontSize="tiny" /> } size="small" sx={ { width: 288 } }>
		<Typography variant="body2">
			{ __( 'To change the default tab, simply set another tab as default.', 'elementor' ) }
		</Typography>
	</Alert>
);

export const ConditionalTooltip = ( {
	showTooltip,
	children,
	content,
	...props
}: InfotipProps & { showTooltip: boolean } ) => {
	if ( ! showTooltip ) {
		return children;
	}

	return (
		<Infotip content={ content } arrow={ false } { ...props } open>
			<span>{ children }</span>
		</Infotip>
	);
};
