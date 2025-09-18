import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import {
	type Control,
	type ControlItem,
	type ControlLayout,
	type Element,
	type ElementControl,
} from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';
import { Divider } from '@elementor/ui';

import { useElement } from '../contexts/element-context';
import { Control as BaseControl } from '../controls-registry/control';
import { ControlTypeContainer } from '../controls-registry/control-type-container';
import { controlsRegistry, type ControlType } from '../controls-registry/controls-registry';
import { SettingsField } from '../controls-registry/settings-field';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { Section } from './section';
import { SectionsList } from './sections-list';

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
						return <Control key={ getKey( control, element ) } control={ control } />;
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
										return <Control key={ getKey( item, element ) } control={ item } />;
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

const Control = ( { control }: { control: Control | ElementControl } ) => {
	if ( ! controlsRegistry.get( control.value.type as ControlType ) ) {
		return null;
	}

	const layout = control.value.meta?.layout || controlsRegistry.getLayout( control.value.type as ControlType );
	const controlProps = populateChildControlProps( control.value.props );

	if ( layout === 'custom' ) {
		controlProps.label = control.value.label;
	}

	if ( control.type === 'element' ) {
		return <ControlLayout control={ control.value } layout={ layout } controlProps={ controlProps } />;
	}

	return (
		<SettingsField bind={ control.value.bind } propDisplayName={ control.value.label || control.value.bind }>
			<ControlLayout control={ control.value } layout={ layout } controlProps={ controlProps } />
		</SettingsField>
	);
};

const ControlLayout = ( {
	control,
	layout,
	controlProps,
}: {
	control: Control[ 'value' ] | ElementControl[ 'value' ];
	layout: ControlLayout;
	controlProps: Record< string, unknown >;
} ) => {
	return (
		<>
			{ control.meta?.topDivider && <Divider /> }
			<ControlTypeContainer layout={ layout }>
				{ control.label && layout !== 'custom' ? <ControlFormLabel>{ control.label }</ControlFormLabel> : null }
				<BaseControl type={ control.type as ControlType } props={ controlProps } />
			</ControlTypeContainer>
		</>
	);
};

function populateChildControlProps( props: Record< string, unknown > ) {
	if ( props.childControlType ) {
		const childComponent = controlsRegistry.get( props.childControlType as ControlType );
		const childPropType = controlsRegistry.getPropTypeUtil( props.childControlType as ControlType );
		props = {
			...props,
			childControlConfig: {
				component: childComponent,
				props: props.childControlProps || {},
				propTypeUtil: childPropType,
			},
		};
	}

	return props;
}

function getKey( control: Control | ElementControl, element: Element ) {
	if ( control.type === 'control' ) {
		return control.value.bind + '.' + element.id;
	}

	return control.value.type + '.' + element.id;
}

function isControl( control: ControlItem ): control is Control | ElementControl {
	return control.type === 'control' || control.type === 'element';
}
