import * as React from 'react';
import { backgroundOverlayPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import { AddItemAction, Header, Item, ItemsContainer, UnstableRepeater } from '../../components/unstable-repeater';
import { DisableItemAction } from '../../components/unstable-repeater/actions/disable-item-action';
import { DuplicateItemAction } from '../../components/unstable-repeater/actions/duplicate-item-action';
import { RemoveItemAction } from '../../components/unstable-repeater/actions/remove-item-action';
import { createControl } from '../../create-control';
import {
	getInitialBackgroundOverlay,
	ItemContent,
	ItemIcon,
	ItemLabel,
} from '../background-control/background-overlay/background-overlay-repeater-control';

export const UnstableBackgroundRepeaterControl = createControl( () => {
	const { propType, value: backgroundValues, setValue } = useBoundProp( backgroundOverlayPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ backgroundValues } setValue={ setValue }>
			<UnstableRepeater initial={ getInitialBackgroundOverlay() } propTypeUtil={ backgroundOverlayPropTypeUtil }>
				<Header label={ __( 'Overlay', 'elementor' ) }>
					<AddItemAction />
				</Header>
				<ItemsContainer itemTemplate={ <Item Icon={ ItemIcon } Label={ ItemLabel } Content={ ItemContent } /> }>
					<DuplicateItemAction />
					<DisableItemAction />
					<RemoveItemAction />
				</ItemsContainer>
			</UnstableRepeater>
		</PropProvider>
	);
} );
