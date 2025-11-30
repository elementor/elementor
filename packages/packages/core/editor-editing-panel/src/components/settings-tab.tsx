import * as React from 'react';
import { type Control, type ControlItem, type Element, type ElementControl } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { useElement } from '../contexts/element-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { Section } from './section';
import { SectionsList } from './sections-list';
import { SettingsControl } from './settings-control';

export const SettingsTab = () => {
	const { elementType, element } = useElement();
	const settingsDefault = useDefaultPanelSettings();

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
						return (
							<Section
								title={ value.label }
								key={ type + '.' + index }
								defaultExpanded={ isDefaultExpanded( value.label ) }
							>
								{ value.items?.map( ( item ) => {
									if ( isControl( item ) ) {
										return <SettingsControl key={ getKey( item, element ) } control={ item } />;
									}

									// TODO: Handle 2nd level sections
									return null;
								} ) }
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
