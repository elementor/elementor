import * as React from 'react';
import { useRef } from 'react';
import { type PropType, transformFunctionsPropTypeUtil, transformPropTypeUtil } from '@elementor/editor-props';
import { AdjustmentsIcon, InfoCircleFilledIcon } from '@elementor/icons';
import { bindTrigger, Box, IconButton, type PopupState, Typography, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlRepeater, Header, Item, ItemsContainer, TooltipAddItemAction } from '../../components/control-repeater';
import { DisableItemAction } from '../../components/control-repeater/actions/disable-item-action';
import { RemoveItemAction } from '../../components/control-repeater/actions/remove-item-action';
import { EditItemPopover } from '../../components/control-repeater/items/edit-item-popover';
import { ControlAdornments } from '../../control-adornments/control-adornments';
import { createControl } from '../../create-control';
import { initialRotateValue, initialScaleValue, initialSkewValue, initialTransformValue } from './initial-values';
import { TransformBaseControl } from './transform-base-control';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';

const SIZE = 'tiny';

export const TransformRepeaterControl = createControl( () => {
	const context = useBoundProp( transformPropTypeUtil );
	const headerRef = useRef< HTMLDivElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );

	return (
		<PropProvider { ...context }>
			<TransformBaseControl popupState={ popupState } anchorRef={ headerRef } />
			<PropKeyProvider bind={ 'transform-functions' }>
				<Repeater headerRef={ headerRef } propType={ context.propType } popupState={ popupState } />
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

const Repeater = ( {
	headerRef,
	propType,
	popupState,
}: {
	headerRef: React.RefObject< HTMLDivElement >;
	propType: PropType;
	popupState: PopupState;
} ) => {
	const transformFunctionsContext = useBoundProp( transformFunctionsPropTypeUtil );
	const availableValues = [ initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue ];
	const { value: transformValues, bind } = transformFunctionsContext;

	const getInitialValue = () => {
		return availableValues.find( ( value ) => ! transformValues?.some( ( item ) => item.$$type === value.$$type ) );
	};

	const shouldDisableAddItem = ! getInitialValue();

	return (
		<PropProvider { ...transformFunctionsContext }>
			<ControlRepeater
				initial={ getInitialValue() ?? initialTransformValue }
				propTypeUtil={ transformFunctionsPropTypeUtil }
			>
				<Header
					label={ __( 'Transform', 'elementor' ) }
					adornment={ () => <ControlAdornments customContext={ { path: [ 'transform' ], propType } } /> }
					ref={ headerRef }
				>
					<TransformBasePopoverTrigger popupState={ popupState } repeaterBindKey={ bind } />
					<TooltipAddItemAction
						disabled={ shouldDisableAddItem }
						tooltipContent={ ToolTip }
						enableTooltip={ shouldDisableAddItem }
						ariaLabel={ 'transform' }
					/>
				</Header>
				<ItemsContainer>
					<Item
						Icon={ TransformIcon }
						Label={ TransformLabel }
						actions={
							<>
								<DisableItemAction />
								<RemoveItemAction />
							</>
						}
					/>
				</ItemsContainer>
				<EditItemPopover>
					<TransformContent />
				</EditItemPopover>
			</ControlRepeater>
		</PropProvider>
	);
};

const TransformBasePopoverTrigger = ( {
	popupState,
	repeaterBindKey,
}: {
	popupState: PopupState;
	repeaterBindKey: string;
} ) => {
	const { bind } = useBoundProp();

	return bind !== repeaterBindKey ? null : (
		<IconButton size={ SIZE } aria-label={ __( 'Base Transform', 'elementor' ) } { ...bindTrigger( popupState ) }>
			<AdjustmentsIcon fontSize={ SIZE } />
		</IconButton>
	);
};
