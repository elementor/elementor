import * as React from 'react';
import {
	ControlFormLabel,
	Repeater,
	type RepeaterItem,
	type SetRepeaterValuesMeta,
	useBoundProp,
} from '@elementor/editor-controls';
import {
	getElementEditorSettings,
	updateElementEditorSettings,
	useElementChildren,
	useElementEditorSettings,
} from '@elementor/editor-elements';
import { type CreateOptions, numberPropTypeUtil } from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, Chip, Infotip, type InfotipProps, Stack, Switch, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { getElementByType } from '../get-element-by-type';
import { TAB_ELEMENT_TYPE, type TabItem, useActions } from './use-actions';

const TAB_MENU_ELEMENT_TYPE = 'e-tabs-menu';
const TAB_CONTENT_AREA_ELEMENT_TYPE = 'e-tabs-content-area';
export const TabsControl = ( { label }: { label: string } ) => {
	return (
		<SettingsField bind="default-active-tab" propDisplayName={ __( 'Tabs', 'elementor' ) }>
			<TabsControlContent label={ label } />
		</SettingsField>
	);
};

export const TabsControlContent = ( { label }: { label: string } ) => {
	const { element } = useElement();
	const { addItem, duplicateItem, moveItem, removeItem } = useActions();

	const { [ TAB_ELEMENT_TYPE ]: tabLinks } = useElementChildren( element.id, {
		[ TAB_MENU_ELEMENT_TYPE ]: TAB_ELEMENT_TYPE,
	} );

	const tabList = getElementByType( element.id, TAB_MENU_ELEMENT_TYPE );
	const tabContentArea = getElementByType( element.id, TAB_CONTENT_AREA_ELEMENT_TYPE );

	const repeaterValues: RepeaterItem< TabItem >[] = tabLinks.map( ( tabLink, index ) => {
		const { title: titleSetting } = getElementEditorSettings( tabLink.id ) ?? {};

		return {
			id: tabLink.id,
			title: titleSetting,
			index,
		};
	} );

	const setValue = (
		_newValues: RepeaterItem< TabItem >[],
		_options: CreateOptions,
		meta?: SetRepeaterValuesMeta< RepeaterItem< TabItem > >
	) => {
		if ( meta?.action?.type === 'add' ) {
			const items = meta.action.payload;

			return addItem( { tabContentAreaId: tabContentArea.id, items, tabsMenuId: tabList.id } );
		}

		if ( meta?.action?.type === 'remove' ) {
			const items = meta.action.payload;

			return removeItem( {
				items,
				tabContentAreaId: tabContentArea.id,
			} );
		}

		if ( meta?.action?.type === 'duplicate' ) {
			const items = meta.action.payload;

			return duplicateItem( { items, tabContentAreaId: tabContentArea.id } );
		}

		if ( meta?.action?.type === 'reorder' ) {
			const { from, to } = meta.action.payload;

			return moveItem( {
				toIndex: to,
				tabsMenuId: tabList.id,
				tabContentAreaId: tabContentArea.id,
				movedElementId: tabLinks[ from ].id,
				movedElementIndex: from,
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
				initialValues: { id: '', title: 'Tab' },
				Label: ItemLabel,
				Content: ItemContent,
				Icon: () => null,
			} }
		/>
	);
};

const ItemLabel = ( { value, index }: { value: TabItem; index: number } ) => {
	const id = value.id ?? '';

	const editorSettings = useElementEditorSettings( id );

	const elementTitle = editorSettings?.title;

	return (
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ elementTitle }</span>
			<ItemDefaultTab index={ index } />
		</Stack>
	);
};

const ItemDefaultTab = ( { index }: { index: number } ) => {
	const { value: defaultItem } = useBoundProp( numberPropTypeUtil );

	const isDefault = defaultItem === index;

	if ( ! isDefault ) {
		return null;
	}

	return <Chip size="tiny" shape="rounded" label={ __( 'Default', 'elementor' ) } />;
};

const ItemContent = ( { value, index }: { value: TabItem; index: number } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<TabLabelControl elementId={ value.id } />
			<SettingsField bind="default-active-tab" propDisplayName={ __( 'Tabs', 'elementor' ) }>
				<DefaultTabControl tabIndex={ index } />
			</SettingsField>
		</Stack>
	);
};

const DefaultTabControl = ( { tabIndex }: { tabIndex: number } ) => {
	const { value, setValue } = useBoundProp( numberPropTypeUtil );

	const isDefault = value === tabIndex;

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
			<ControlFormLabel>{ __( 'Set as default tab', 'elementor' ) }</ControlFormLabel>
			<ConditionalTooltip showTooltip={ isDefault } placement="right">
				<Switch
					size="small"
					checked={ isDefault }
					disabled={ isDefault }
					onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
						setValue( target.checked ? tabIndex : null );
					} }
					inputProps={ {
						...( isDefault ? { style: { opacity: 0, cursor: 'not-allowed' } } : {} ),
					} }
				/>
			</ConditionalTooltip>
		</Stack>
	);
};

const TabLabelControl = ( { elementId }: { elementId: string } ) => {
	const editorSettings = useElementEditorSettings( elementId );

	const label = editorSettings?.title ?? '';

	return (
		<Stack gap={ 1 }>
			<ControlFormLabel>{ __( 'Tab name', 'elementor' ) }</ControlFormLabel>
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

export const ConditionalTooltip = ( {
	showTooltip,
	children,
}: Omit< InfotipProps, 'content' > & { showTooltip: boolean } ) => {
	if ( ! showTooltip ) {
		return children;
	}

	return (
		<Infotip
			arrow={ false }
			content={
				<Alert
					color="secondary"
					icon={ <InfoCircleFilledIcon fontSize="tiny" /> }
					size="small"
					sx={ { width: 288 } }
				>
					<Typography variant="body2">
						{ __( 'To change the default tab, simply set another tab as default.', 'elementor' ) }
					</Typography>
				</Alert>
			}
		>
			<span>{ children }</span>
		</Infotip>
	);
};
