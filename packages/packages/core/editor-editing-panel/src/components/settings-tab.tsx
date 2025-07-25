import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { type Control } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';
import { Divider } from '@elementor/ui';

import { useElement } from '../contexts/element-context';
import { Control as BaseControl } from '../controls-registry/control';
import { ControlTypeContainer } from '../controls-registry/control-type-container';
import {
	type ControlType,
	getControl,
	getDefaultLayout,
	getPropTypeUtil,
} from '../controls-registry/controls-registry';
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
				{ elementType.controls.map( ( { type, value }, index ) => {
					if ( type === 'control' ) {
						return <Control key={ value.bind } control={ value } />;
					}

					if ( type === 'section' ) {
						return (
							<Section
								title={ value.label }
								key={ type + '.' + index }
								defaultExpanded={ isDefaultExpanded( value.label ) }
							>
								{ value.items?.map( ( item ) => {
									if ( item.type === 'control' ) {
										return <Control key={ item.value.bind } control={ item.value } />;
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

const Control = ( { control }: { control: Control[ 'value' ] } ) => {
	if ( ! getControl( control.type as ControlType ) ) {
		return null;
	}

	const layout = control.meta?.layout || getDefaultLayout( control.type as ControlType );
	const controlProps = populateChildControlProps( control.props );
	if ( layout === 'custom' ) {
		controlProps.label = control.label;
	}

	return (
		<SettingsField bind={ control.bind } propDisplayName={ control.label || control.bind }>
			{ control.meta?.topDivider && <Divider /> }
			<ControlTypeContainer layout={ layout }>
				{ control.label && layout !== 'custom' ? <ControlFormLabel>{ control.label }</ControlFormLabel> : null }
				<BaseControl type={ control.type as ControlType } props={ controlProps } />
			</ControlTypeContainer>
		</SettingsField>
	);
};

function populateChildControlProps( props: Record< string, unknown > ) {
	if ( props.childControlType ) {
		const childComponent = getControl( props.childControlType as ControlType );
		const childPropType = getPropTypeUtil( props.childControlType as ControlType );
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
