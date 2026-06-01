import * as React from 'react';
import { PropKeyProvider } from '@elementor/editor-controls';
import { type Control } from '@elementor/editor-elements';
import { type Props, type PropsSchema } from '@elementor/editor-props';

import { ControlLayout, populateChildControlProps } from '../controls-registry/control-layout';
import { controlsRegistry, type ControlType } from '../controls-registry/controls-registry';
import { extractDependencyEffect } from '../utils/prop-dependency-utils';

type NestedSettingsControlProps = {
	control: Control;
	shape: PropsSchema;
	settings: Props;
};

export const NestedSettingsControl = ( { control: { value }, shape, settings }: NestedSettingsControlProps ) => {
	if ( ! controlsRegistry.get( value.type as ControlType ) ) {
		return null;
	}

	const { isHidden } = extractDependencyEffect( value.bind, shape, settings );

	if ( isHidden ) {
		return null;
	}

	const layout = value.meta?.layout || controlsRegistry.getLayout( value.type as ControlType );
	const controlProps = populateChildControlProps( value.props );

	if ( layout === 'custom' ) {
		controlProps.label = value.label;
	}

	return (
		<PropKeyProvider bind={ value.bind }>
			<ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />
		</PropKeyProvider>
	);
};
