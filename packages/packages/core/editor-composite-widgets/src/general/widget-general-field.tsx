import * as React from 'react';
import { ElementProvider, SettingsControl, useControlsByWidgetType } from '@elementor/editor-editing-panel';
import { type Control } from '@elementor/editor-elements';
import { SessionStorageProvider } from '@elementor/session';

import { type CompositeWidgetField } from '../types';
import { type WidgetPartElement } from './use-widget-part-elements';

type Props = {
	field: CompositeWidgetField;
	partElement: WidgetPartElement | null;
};

export function WidgetGeneralField( { field, partElement }: Props ) {
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
