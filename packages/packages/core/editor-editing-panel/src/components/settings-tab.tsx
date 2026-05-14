import * as React from 'react';
import { type Control, type ControlItem, type Element, type ElementControl } from '@elementor/editor-elements';
import { type Props, type PropsSchema } from '@elementor/editor-props';
import { SessionStorageProvider } from '@elementor/session';

import { useElement } from '../contexts/element-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { extractDependencyEffect } from '../utils/prop-dependency-utils';
import { Section } from './section';
import { SectionsList } from './sections-list';
import { SettingsControl } from './settings-control';

export const SettingsTab = () => {
	const { elementType, element, settings } = useElement();
	const settingsDefault = useDefaultPanelSettings();
	const currentSettings = settings as Props;

	const isDefaultExpanded = ( sectionId: string ) =>
		settingsDefault.defaultSectionsExpanded.settings?.includes( sectionId );

	return (
		<SessionStorageProvider prefix={ element.id }>
			<SectionsList>
				{ elementType.controls.map( ( control, index ) => {
					if ( isControl( control ) ) {
						return <SettingsControl key={ getKey( control, element ) } control={ control } />;
					}

					const { type, value } = control;

					if ( type === 'section' ) {
						const sectionItems = renderSectionItems( {
							items: value.items,
							element,
							propsSchema: elementType.propsSchema,
							settings: currentSettings,
						} );

						if ( ! sectionItems.length ) {
							return null;
						}

						return (
							<Section
								title={ value.label }
								key={ type + '.' + index }
								defaultExpanded={ isDefaultExpanded( value.label ) }
							>
								{ sectionItems }
							</Section>
						);
					}

					return null;
				} ) }
			</SectionsList>
		</SessionStorageProvider>
	);
};

function getKey( control: Control | ElementControl, element: Element ) {
	if ( control.type === 'control' ) {
		return control.value.bind + '.' + element.id;
	}

	return control.value.type + '.' + element.id;
}

function isControl( control: ControlItem ): control is Control | ElementControl {
	return control.type === 'control' || control.type === 'element-control';
}

function renderSectionItems( {
	items,
	element,
	propsSchema,
	settings,
}: {
	items?: ControlItem[];
	element: Element;
	propsSchema: PropsSchema;
	settings: Props;
} ) {
	return (
		items?.flatMap( ( item ) => {
			if ( ! isControl( item ) ) {
				// TODO: Handle 2nd level sections
				return [];
			}

			if ( item.type === 'control' && isControlHiddenByDependencies( item, propsSchema, settings ) ) {
				return [];
			}

			return [ <SettingsControl key={ getKey( item, element ) } control={ item } /> ];
		} ) ?? []
	);
}

function isControlHiddenByDependencies( control: Control, propsSchema: PropsSchema, settings: Props ) {
	const { isHidden } = extractDependencyEffect( control.value.bind, propsSchema, settings );

	return isHidden;
}
