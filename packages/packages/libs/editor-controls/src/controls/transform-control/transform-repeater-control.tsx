import * as React from 'react';
import { transformFunctionsPropTypeUtil, transformPropTypeUtil } from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
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

export const TransformRepeaterControl = createControl( () => {
	const context = useBoundProp( transformPropTypeUtil );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind="transform-functions">
				<Repeater />
			</PropKeyProvider>
		</PropProvider>
	);
} );

const ToolTip = (
	<Box
		component="span"
		aria-label={ undefined }
		sx={ { display: 'flex', gap: 0.5, p: 2, width: 320, borderRadius: 1 } }
	>
		<InfoCircleFilledIcon sx={ { color: 'secondary.main' } } />
		<Typography variant="body2" color="text.secondary" fontSize="14px">
			{ __( 'You can use each kind of transform only once per element.', 'elementor' ) }
		</Typography>
	</Box>
);

const Repeater = () => {
	const transformFunctionsContext = useBoundProp( transformFunctionsPropTypeUtil );
	const availableValues = [ initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue ];
	const { value: transformValues } = transformFunctionsContext;

	const getInitialValue = () => {
		return availableValues.find( ( value ) => ! transformValues?.some( ( item ) => item.$$type === value.$$type ) );
	};

	const shouldDisableAddItem = ! getInitialValue();

	return (
		<PropProvider { ...transformFunctionsContext }>
			<UnstableRepeater
				initial={ getInitialValue() ?? initialTransformValue }
				propTypeUtil={ transformFunctionsPropTypeUtil }
			>
				<Header label={ __( 'Transform', 'elementor' ) }>
					<TooltipAddItemAction
						disabled={ shouldDisableAddItem }
						tooltipContent={ ToolTip }
						enableTooltip={ shouldDisableAddItem }
					/>
				</Header>
				<ItemsContainer itemTemplate={ <Item Icon={ TransformIcon } Label={ TransformLabel } /> }>
					<DisableItemAction />
					<RemoveItemAction />
				</ItemsContainer>
				<EditItemPopover>
					<TransformContent />
				</EditItemPopover>
			</UnstableRepeater>
		</PropProvider>
	);
};
