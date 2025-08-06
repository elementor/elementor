import * as React from 'react';
import { transformPropTypeUtil } from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import {
	Header,
	Item,
	ItemsContainer,
	TooltipAddItemAction,
	UnstableRepeater,
} from '../../components/unstable-repeater';
import { DisableItemAction } from '../../components/unstable-repeater/actions/disable-item-action';
import { RemoveItemAction } from '../../components/unstable-repeater/actions/remove-item-action';
import { EditItemPopover } from '../../components/unstable-repeater/items/edit-item-popover';
import { createControl } from '../../create-control';
import { initialRotateValue, initialScaleValue, initialSkewValue, initialTransformValue } from './initial-values';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';

export const TransformRepeaterControl = createControl(
	( {
		setTransformBasePopoverAnchorRef,
	}: {
		setTransformBasePopoverAnchorRef?: ( ref?: HTMLDivElement ) => void;
	} ) => {
		const { propType, value: transformValues, setValue } = useBoundProp( transformPropTypeUtil );
		const availableValues = [ initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue ];

		const getInitialValue = () => {
			return availableValues.find(
				( value ) => ! transformValues?.some( ( item ) => item.$$type === value.$$type )
			);
		};

		const shouldDisableAddItem = ! getInitialValue();

		return (
			<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
				<UnstableRepeater
					initial={ getInitialValue() ?? initialTransformValue }
					propTypeUtil={ transformPropTypeUtil }
				>
					<Header label={ __( 'Transform', 'elementor' ) }>
						<TooltipAddItemAction
							disabled={ shouldDisableAddItem }
							tooltipContent={ ToolTip }
							enableTooltip={ shouldDisableAddItem }
						/>
					</Header>
					<ItemsContainer
						setItemsContainerRef={ setTransformBasePopoverAnchorRef }
						itemTemplate={ <Item Icon={ TransformIcon } Label={ TransformLabel } /> }
					>
						<DisableItemAction />
						<RemoveItemAction />
					</ItemsContainer>
					<EditItemPopover>
						<TransformContent />
					</EditItemPopover>
				</UnstableRepeater>
			</PropProvider>
		);
	}
);

const ToolTip = (
	<>
		<InfoCircleFilledIcon sx={ { color: 'secondary.main' } } />
		<Typography variant="body2" color="text.secondary" fontSize="14px">
			{ __( 'You can use each kind of transform only once per element.', 'elementor' ) }
		</Typography>
	</>
);
//
//
// import * as React from 'react';
// import { transformPropTypeUtil } from '@elementor/editor-props';
// import { __ } from '@wordpress/i18n';
//
// import { PropProvider, useBoundProp } from '../../bound-prop-context';
// import { AddItemAction, Header, Item, ItemsContainer, UnstableRepeater } from '../../components/unstable-repeater';
// import { DisableItemAction } from '../../components/unstable-repeater/actions/disable-item-action';
// import { RemoveItemAction } from '../../components/unstable-repeater/actions/remove-item-action';
// import { createControl } from '../../create-control';
// import { TransformContent } from '../transform-control/transform-content';
// import { TransformIcon } from '../transform-control/transform-icon';
// import { TransformLabel } from '../transform-control/transform-label';
// import { initialTransformValue } from '../transform-control/types';
//
// export const UnstableTransformRepeaterControl = createControl(
// 	( {
// 		  setTransformOriginPopoverAnchorRef,
// 	  }: {
// 		setTransformOriginPopoverAnchorRef?: ( ref?: HTMLDivElement ) => void;
// 	} ) => {
// 		const { propType, value: transformValues, setValue } = useBoundProp( transformPropTypeUtil );
//
// 		return (
// 			<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
// 				<UnstableRepeater initial={ initialTransformValue } propTypeUtil={ transformPropTypeUtil }>
// 					<Header label={ __( 'Transform', 'elementor' ) }>
// 						<Spacer />
// 						<AddItemAction />
// 					</Header>
// 					<ItemsContainer
// 						setTransformOriginPopoverAnchorRef={ setTransformOriginPopoverAnchorRef }
// 						itemTemplate={
// 							<Item Icon={ TransformIcon } Label={ TransformLabel } Content={ TransformContent } />
// 						}
// 					>
// 						<DisableItemAction />
// 						<RemoveItemAction />
// 					</ItemsContainer>
// 				</UnstableRepeater>
// 			</PropProvider>
// 		);
// 	}
// );
//
// const Spacer = () => <span style={ { marginInlineStart: 'auto' } }></span>;
