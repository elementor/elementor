import * as React from 'react';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { createTopLevelObjectType } from '@elementor/editor-props';

import { useInteractions } from '../hooks/use-interactions';
import { getInteractionSchema } from '../sync/get-interactions-schema';
import { Repeater } from './reapeater/repeater';

export const InteractionsField = () => {
	const { value, setValue } = useInteractions();

	const schema = getInteractionSchema();

	const propType = createTopLevelObjectType( { schema } );

	return (
		<PropProvider setValue={ setValue } value={ value } propType={ propType }>
			<PropKeyProvider bind="interactions">
				<Repeater />
			</PropKeyProvider>
		</PropProvider>
	);
};
