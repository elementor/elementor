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
import { createControl } from '../../create-control';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';
import { initialRotateValue, initialScaleValue, initialSkewValue, initialTransformValue } from './types';

export const TransformRepeaterControl = createControl( () => {
	const { propType, value: transformValues, setValue } = useBoundProp( transformPropTypeUtil );
	const availableValues = [ initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue ];

	const getInitialValue = () => {
		return availableValues.find( ( value ) => ! transformValues?.some( ( item ) => item.$$type === value.$$type ) );
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

const ToolTip = (
	<>
		<InfoCircleFilledIcon sx={ { color: 'secondary.main' } } />
		<Typography variant="body2" color="text.secondary" fontSize="14px">
			{ __( 'You can use each kind of transform only once per element.', 'elementor' ) }
		</Typography>
	</>
);
