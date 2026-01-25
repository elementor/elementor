import * as React from 'react';
import { ControlAdornmentsProvider } from '@elementor/editor-controls';
import { type Control, type ControlLayout, type ElementControl } from '@elementor/editor-elements';
import { Divider, styled } from '@elementor/ui';

import { Control as BaseControl } from '../controls-registry/control';
import { ControlTypeContainer } from '../controls-registry/control-type-container';
import { controlsRegistry, type ControlType } from '../controls-registry/controls-registry';
import { SettingsField } from '../controls-registry/settings-field';
import { getFieldIndicators } from '../field-indicators-registry';
import { ControlLabel } from './control-label';

const Wrapper = styled( 'span' )`
	display: contents;
`;

export const SettingsControl = ( { control: { value, type } }: { control: Control | ElementControl } ) => {
	if ( ! controlsRegistry.get( value.type as ControlType ) ) {
		return null;
	}

	const layout = value.meta?.layout || controlsRegistry.getLayout( value.type as ControlType );
	const controlProps = populateChildControlProps( value.props );

	if ( layout === 'custom' ) {
		controlProps.label = value.label;
	}

	if ( type === 'element-control' ) {
		return <ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />;
	}

	return (
		<SettingsField bind={ value.bind } propDisplayName={ value.label || value.bind }>
			<ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />
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
	const controlType = control.type as ControlType;

	return (
		<ControlAdornmentsProvider items={ getFieldIndicators( 'settings' ) }>
			{ control.meta?.topDivider && <Divider /> }
			<Wrapper data-type="settings-field">
				<ControlTypeContainer layout={ layout }>
					{ control.label && layout !== 'custom' ? <ControlLabel>{ control.label }</ControlLabel> : null }
					<BaseControl type={ controlType } props={ controlProps } />
				</ControlTypeContainer>
			</Wrapper>
		</ControlAdornmentsProvider>
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
