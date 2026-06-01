import * as React from 'react';
import { ControlAdornmentsProvider } from '@elementor/editor-controls';
import { type Control, type ControlLayout as ControlLayoutType, type ElementControl } from '@elementor/editor-elements';
import { Divider, styled } from '@elementor/ui';

import { ControlLabel } from '../components/control-label';
import { getFieldIndicators } from '../field-indicators-registry';
import { Control as BaseControl } from './control';
import { ControlTypeContainer } from './control-type-container';
import { controlsRegistry, type ControlType } from './controls-registry';

const Wrapper = styled( 'span' )`
	display: contents;
`;

export const ControlLayout = ( {
	control,
	layout,
	controlProps,
}: {
	control: Control[ 'value' ] | ElementControl[ 'value' ];
	layout: ControlLayoutType;
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

export function populateChildControlProps( props: Record< string, unknown > ) {
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
