import * as React from 'react';
import { transformPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import {
	AddItemAction,
	Header,
	Item,
	ItemsContainer,
	Label,
	UnstableRepeater,
} from '../../components/unstable-repeater';
import { createControl } from '../../create-control';

export const UnstableTransformRepeaterControl = createControl( () => {
	const { propType, value: transformValues, setValue, disabled } = useBoundProp( transformPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
			<UnstableRepeater>
				<Header>
					<Label>{ __( 'Transform', 'elementor' ) }</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initialValue={ { text: 'Hello world' } }>
					<Item />
				</ItemsContainer>
			</UnstableRepeater>
		</PropProvider>
	);
} );
