import * as React from 'react';
import { transformPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import { AddItemAction, Header, Item, ItemsContainer, UnstableRepeater } from '../../components/unstable-repeater';
import { DisableItemAction } from '../../components/unstable-repeater/actions/disable-item-action';
import { RemoveItemAction } from '../../components/unstable-repeater/actions/remove-item-action';
import { createControl } from '../../create-control';
import { TransformOriginControl } from '../transform-control/transform-origin-control';
import { TransformContent } from '../transform-control/transform-content';
import { TransformIcon } from '../transform-control/transform-icon';
import { TransformLabel } from '../transform-control/transform-label';
import { initialTransformValue } from '../transform-control/types';

export const UnstableTransformRepeaterControl = createControl( () => {
	const { propType, value: transformValues, setValue } = useBoundProp( transformPropTypeUtil );
	const transformOriginPopoverAnchorRef = React.useRef< HTMLDivElement | null >( null );

	const setContainerEl = ( ref?: HTMLDivElement ) => ( transformOriginPopoverAnchorRef.current = ref ?? null );

	return (
		<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
			<UnstableRepeater initial={ initialTransformValue } propTypeUtil={ transformPropTypeUtil }>
				<Header label={ __( 'Transform', 'elementor' ) }>
					<Spacer />
					<TransformOriginControl anchorRef={ transformOriginPopoverAnchorRef } />
					<AddItemAction />
				</Header>
				<ItemsContainer
					setContainerEl={ setContainerEl }
					itemTemplate={
						<Item Icon={ TransformIcon } Label={ TransformLabel } Content={ TransformContent } />
					}
				>
					<DisableItemAction />
					<RemoveItemAction />
				</ItemsContainer>
			</UnstableRepeater>
		</PropProvider>
	);
} );

const Spacer = () => <span style={ { marginInlineStart: 'auto' } }></span>;
