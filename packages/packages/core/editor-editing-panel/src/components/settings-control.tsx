import * as React from 'react';
import { PropKeyProvider } from '@elementor/editor-controls';
import { type Control, type ElementControl } from '@elementor/editor-elements';
import { type Props, type PropsSchema } from '@elementor/editor-props';

import { ControlLayout, populateChildControlProps } from '../controls-registry/control-layout';
import { controlsRegistry, type ControlType } from '../controls-registry/controls-registry';
import { SettingsField } from '../controls-registry/settings-field';
import { extractDependencyEffect } from '../utils/prop-dependency-utils';

type SettingsControlProps = {
	control: Control | ElementControl;
	dependencyScope?: {
		shape: PropsSchema;
		settings: Props;
	};
};

export const SettingsControl = ( { control: { value, type }, dependencyScope }: SettingsControlProps ) => {
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

	if ( dependencyScope ) {
		const { isHidden } = extractDependencyEffect(
			value.bind,
			dependencyScope.shape,
			dependencyScope.settings
		);

		if ( isHidden ) {
			return null;
		}

		return (
			<PropKeyProvider bind={ value.bind }>
				<ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />
			</PropKeyProvider>
		);
	}

	return (
		<SettingsField bind={ value.bind } propDisplayName={ value.label || value.bind }>
			<ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />
		</SettingsField>
	);
};
