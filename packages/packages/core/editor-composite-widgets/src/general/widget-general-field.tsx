import * as React from 'react';
import { ElementProvider, SettingsControl, useControlsByWidgetType } from '@elementor/editor-editing-panel';
import { type Control, type V1Element } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { type CompositeWidgetField } from '../types';
import { useWidgetPartElement } from './use-widget-part-element';

type Props = {
	root: V1Element;
	field: CompositeWidgetField;
};

export function WidgetGeneralField( { root, field }: Props ) {
	const partElement = useWidgetPartElement( root, field.target.part );
	const controls = useControlsByWidgetType( partElement?.element.type ?? '' );
	const control = controls[ field.target.prop ];

	if ( ! partElement || ! control ) {
		return null;
	}

	return (
		<ElementProvider { ...partElement }>
			<SessionStorageProvider prefix={ partElement.element.id }>
				<SettingsControl control={ withLabel( control, field.label ) } />
			</SessionStorageProvider>
		</ElementProvider>
	);
}

function withLabel( control: Control, label: string ): Control {
	return { ...control, value: { ...control.value, label } };
}
