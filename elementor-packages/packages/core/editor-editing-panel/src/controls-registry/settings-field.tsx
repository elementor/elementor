import * as React from 'react';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { type PropKey, type PropValue } from '@elementor/editor-props';

import { useElement } from '../contexts/element-context';
import { createTopLevelOjectType } from './create-top-level-object-type';

type Props = {
	bind: PropKey;
	children: React.ReactNode;
};

export const SettingsField = ( { bind, children }: Props ) => {
	const { element, elementType } = useElement();

	const settingsValue = useElementSetting< PropValue >( element.id, bind );

	const value = { [ bind ]: settingsValue };

	const propType = createTopLevelOjectType( { schema: elementType.propsSchema } );

	const setValue = ( newValue: Record< string, PropValue > ) => {
		updateElementSettings( {
			id: element.id,
			props: { ...newValue },
		} );
	};

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue }>
			<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
		</PropProvider>
	);
};
