import * as React from 'react';
import { useRef } from 'react';
import { type PropType, transformFunctionsPropTypeUtil, transformPropTypeUtil } from '@elementor/editor-props';
import { AdjustmentsIcon, InfoCircleFilledIcon } from '@elementor/icons';
import { bindTrigger, Box, IconButton, type PopupState, Typography, usePopupState } from '@elementor/ui';
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
import { injectIntoRepeaterHeaderActions } from '../../components/unstable-repeater/locations';
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

	const repeaterBindKey = 'transform-functions';

	injectIntoRepeaterHeaderActions( {
		id: 'transform-base-control',
		component: () => <TransformBasePopoverTrigger popupState={ popupState } repeaterBindKey={ repeaterBindKey } />,
		options: { overwrite: true },
	} );

	return (
		<PropProvider { ...context }>
			<TransformBaseControl popupState={ popupState } anchorRef={ headerRef } />
			<PropKeyProvider bind={ repeaterBindKey }>
				<Repeater headerRef={ headerRef } propType={ context.propType } />
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

const Repeater = ( { headerRef, propType }: { headerRef: React.RefObject< HTMLDivElement >; propType: PropType } ) => {
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
				<Header
					label={ __( 'Transform', 'elementor' ) }
					adornment={ () => <ControlAdornments customContext={ { path: [ 'transform' ], propType } } /> }
					ref={ headerRef }
				>
					<TooltipAddItemAction
						disabled={ shouldDisableAddItem }
						tooltipContent={ ToolTip }
						enableTooltip={ shouldDisableAddItem }
						ariaLabel={ 'transform' }
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
