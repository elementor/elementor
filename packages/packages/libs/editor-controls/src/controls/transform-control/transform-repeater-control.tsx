import * as React from 'react';
import { useRef } from 'react';
import {
	ObjectPropType,
	perspectiveOriginPropTypeUtil,
	type PerspectiveOriginPropValue,
	transformFunctionsPropTypeUtil,
	transformOriginPropTypeUtil,
	type TransformOriginPropValue,
	transformPropTypeUtil,
} from '@elementor/editor-props';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, UseBoundProp, useBoundProp } from '../../bound-prop-context';
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
import { TransformBaseControl } from './transform-base-control';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';

export const TransformRepeaterControl = createControl( () => {
	const context = useBoundProp( transformPropTypeUtil );
	const { propType, value, setValue } = context;

	const transformOriginValue = value?.[ 'transform-origin' ] as TransformOriginPropValue;
	const setTransformOriginValue = ( newValue: TransformOriginPropValue ) => {
		if ( ! newValue ) {
			setValue( value ? { ...value, 'transform-origin': null } : null );

			return;
		}

		const valueToSave = {
			...( value ?? {} ),
			'transform-origin': newValue,
		};

		setValue( valueToSave );
	};
	const transformOriginContext: UseBoundProp< TransformOriginPropValue > = {
		propType: ( propType as ObjectPropType ).shape[ 'transform-origin' ],
		value: transformOriginValue,
		setValue: setTransformOriginValue,
	};

	// const transformOriginContext = useBoundProp( transformOriginPropTypeUtil );
	console.log( 'transformOriginContext', transformOriginContext );
	// const perspectiveOriginContext = useBoundProp( perspectiveOriginPropTypeUtil );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind="transform-functions">
				<Repeater
				transformOriginContext={ transformOriginContext }
				// perspectiveOriginContext={ perspectiveOriginContext }
				/>
			</PropKeyProvider>
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

const Repeater = ( {
									 transformOriginContext,

                   }
// perspectiveOriginContext,
: {
	transformOriginContext: UseBoundProp< TransformOriginPropValue >;
	// perspectiveOriginContext: UseBoundProp< PerspectiveOriginPropValue >;
} ) => {
	const transformFunctionsContext = useBoundProp( transformFunctionsPropTypeUtil );
	const availableValues = [ initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue ];
	const { value: transformValues } = transformFunctionsContext;
	const headerRef = React.useRef< HTMLDivElement >( null );

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
				<Header label={ __( 'Transform', 'elementor' ) } ref={ headerRef }>
					<TransformBaseControl
						anchorRef={ headerRef }
						// perspectiveOriginContext={ perspectiveOriginContext }
						transformOriginContext={ transformOriginContext }
					/>
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
