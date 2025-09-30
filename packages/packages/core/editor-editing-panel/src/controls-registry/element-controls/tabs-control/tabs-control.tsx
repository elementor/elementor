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
import { type CreateOptions, stringPropTypeUtil } from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, Chip, Infotip, type InfotipProps, Stack, Switch, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { SettingsField } from '../../settings-field';
import { getElementByType } from '../get-element-by-type';
import {
	addItem,
	duplicateItem,
	moveItem,
	removeItem,
	TAB_ELEMENT_TYPE,
	TAB_PANEL_ELEMENT_TYPE,
	type TabItem,
} from './actions';

const TAB_LIST_ELEMENT_TYPE = 'e-tabs-list';
const TAB_CONTENT_ELEMENT_TYPE = 'e-tabs-content';

export const TabsControl = ( { label }: { label: string } ) => {
	const { element } = useElement();

	const { [ TAB_ELEMENT_TYPE ]: tabLinks } = useElementChildren( element.id, [
		TAB_ELEMENT_TYPE,
		TAB_PANEL_ELEMENT_TYPE,
	] );

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
			label={ label }
			itemSettings={ {
				initialValues: { title: 'Tab' },
				Label: ItemLabel,
				Content: ItemContent,
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
		<Stack sx={ { minHeight: 20 } } direction="row" alignItems="center" gap={ 1.5 }>
			<span>{ elementTitle }</span>
			<SettingsField bind={ 'default-active-tab' } propDisplayName={ __( 'Tabs', 'elementor' ) }>
				<ItemDefaultTab value={ value } />
			</SettingsField>
		</Stack>
	);
};

const ItemDefaultTab = ( { value }: { value: TabItem } ) => {
	const id = value.id ?? '';
	const { value: defaultItem } = useBoundProp( stringPropTypeUtil );

	const isDefault = defaultItem === id;

	if ( ! isDefault ) {
		return null;
	}

	return <Chip size="tiny" shape="rounded" label={ __( 'Default', 'elementor' ) } />;
};

const ItemContent = ( { value }: { value: TabItem } ) => {
	if ( ! value.id ) {
		return null;
	}

	return (
		<Stack p={ 2 } gap={ 1.5 }>
			<TabLabelControl elementId={ value.id } />
			<SettingsField bind={ 'default-active-tab' } propDisplayName={ __( 'Tabs', 'elementor' ) }>
				<DefaultTabControl elementId={ value.id } />
			</SettingsField>
		</Stack>
	);
};

const DefaultTabControl = ( { elementId }: { elementId: string } ) => {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );

	const isDefault = value === elementId;

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
			<ControlFormLabel>{ __( 'Set as default tab', 'elementor' ) }</ControlFormLabel>
			<ConditionalTooltip showTooltip={ isDefault } placement="right">
				<Switch
					size="small"
					checked={ isDefault }
					disabled={ isDefault }
					onChange={ ( { target }: React.ChangeEvent< HTMLInputElement > ) => {
						setValue( target.checked ? elementId : null );
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
