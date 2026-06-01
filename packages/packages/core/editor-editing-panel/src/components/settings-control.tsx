import * as React from 'react';
import { type Control, type ElementControl } from '@elementor/editor-elements';

import { ControlLayout } from '../controls-registry/control-layout';
import { resolveControlPresentation } from '../controls-registry/resolve-control-presentation';
import { SettingsField } from '../controls-registry/settings-field';

export const SettingsControl = ( { control: { value, type } }: { control: Control | ElementControl } ) => {
	const presentation = resolveControlPresentation( {
		type: value.type,
		label: value.label,
		props: value.props,
		meta: value.meta,
	} );

	if ( ! presentation ) {
		return null;
	}

	const { layout, controlProps } = presentation;

	if ( type === 'element-control' ) {
		return <ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />;
	}

	return (
		<SettingsField bind={ value.bind } propDisplayName={ value.label || value.bind }>
			<ControlLayout control={ value } layout={ layout } controlProps={ controlProps } />
		</SettingsField>
	);
};
