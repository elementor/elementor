import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { boxShadowPropTypeUtil, shadowPropTypeUtil, type ShadowPropValue } from '@elementor/editor-props';
import { FormLabel, Grid, styled, type SxProps, type Theme, UnstableColorIndicator } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlRepeater, Item, ItemsContainer, TooltipAddItemAction } from '../components/control-repeater';
import { DisableItemAction } from '../components/control-repeater/actions/disable-item-action';
import { DuplicateItemAction } from '../components/control-repeater/actions/duplicate-item-action';
import { RemoveItemAction } from '../components/control-repeater/actions/remove-item-action';
import { useRepeaterContext } from '../components/control-repeater/context/repeater-context';
import { EditItemPopover } from '../components/control-repeater/items/edit-item-popover';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { RepeaterHeader } from '../components/repeater/repeater-header';
import { createControl } from '../create-control';
import { ColorControl } from './color-control';
import { SelectControl } from './select-control';
import { CUSTOM_SIZE_LABEL, SizeControl } from './size-control';

export const BoxShadowRepeaterControl = createControl( () => {
	const { propType, value, setValue, disabled } = useBoundProp( boxShadowPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ () => disabled }>
			<ControlRepeater initial={ initialShadow } propTypeUtil={ boxShadowPropTypeUtil }>
				<RepeaterHeader label={ __( 'Box shadow', 'elementor' ) }>
					<TooltipAddItemAction newItemIndex={ 0 } disabled={ disabled } ariaLabel={ 'Box shadow' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item
						Icon={ ItemIcon }
						Label={ ItemLabel }
						actions={
							<>
								<DuplicateItemAction />
								<DisableItemAction />
								<RemoveItemAction />
							</>
						}
					/>
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		</PropProvider>
	);
} );

const StyledUnstableColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	height: '1rem',
	width: '1rem',
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
} ) );

const ItemIcon = ( { value }: { value: ShadowPropValue } ) => (
	<StyledUnstableColorIndicator size="inherit" component="span" value={ value.value.color?.value } />
);

const Content = () => {
	const context = useBoundProp( shadowPropTypeUtil );
	const rowRef: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ) ];
	const { rowRef: anchorEl } = useRepeaterContext();

	return (
		<PropProvider { ...context }>
			<PopoverContent p={ 1.5 }>
				<PopoverGridContainer>
					<Control bind="color" label={ __( 'Color', 'elementor' ) }>
						<ColorControl anchorEl={ anchorEl } />
					</Control>
					<Control bind="position" label={ __( 'Position', 'elementor' ) } sx={ { overflow: 'hidden' } }>
						<SelectControl
							options={ [
								{ label: __( 'Inset', 'elementor' ), value: 'inset' },
								{ label: __( 'Outset', 'elementor' ), value: null },
							] }
						/>
					</Control>
				</PopoverGridContainer>
				<PopoverGridContainer ref={ rowRef[ 0 ] }>
					<Control bind="hOffset" label={ __( 'Horizontal', 'elementor' ) }>
						<SizeControl anchorRef={ rowRef[ 0 ] } />
					</Control>
					<Control bind="vOffset" label={ __( 'Vertical', 'elementor' ) }>
						<SizeControl anchorRef={ rowRef[ 0 ] } />
					</Control>
				</PopoverGridContainer>
				<PopoverGridContainer ref={ rowRef[ 1 ] }>
					<Control bind="blur" label={ __( 'Blur', 'elementor' ) }>
						<SizeControl anchorRef={ rowRef[ 1 ] } />
					</Control>
					<Control bind="spread" label={ __( 'Spread', 'elementor' ) }>
						<SizeControl anchorRef={ rowRef[ 1 ] } />
					</Control>
				</PopoverGridContainer>
			</PopoverContent>
		</PropProvider>
	);
};

const Control = ( {
	label,
	bind,
	children,
	sx,
}: {
	bind: string;
	label: string;
	children: React.ReactNode;
	sx?: SxProps< Theme >;
} ) => (
	<PropKeyProvider bind={ bind }>
		<Grid item xs={ 6 } sx={ sx }>
			<Grid container gap={ 0.75 } alignItems="center">
				<Grid item xs={ 12 }>
					<FormLabel size="tiny">{ label }</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					{ children }
				</Grid>
			</Grid>
		</Grid>
	</PropKeyProvider>
);

const ItemLabel = ( { value }: { value: ShadowPropValue } ) => {
	const { position, hOffset, vOffset, blur, spread } = value.value;

	const { size: blurSize = '', unit: blurUnit = '' } = blur?.value || {};
	const { size: spreadSize = '', unit: spreadUnit = '' } = spread?.value || {};
	const { size: hOffsetSize = 'unset', unit: hOffsetUnit = '' } = hOffset?.value || {};
	const { size: vOffsetSize = 'unset', unit: vOffsetUnit = '' } = vOffset?.value || {};
	const positionLabel = position?.value || 'outset';

	const sizes = [
		[ hOffsetSize, hOffsetUnit ],
		[ vOffsetSize, vOffsetUnit ],
		[ blurSize, blurUnit ],
		[ spreadSize, spreadUnit ],
	]
		.map( ( [ size, unit ] ) => {
			if ( unit !== 'custom' ) {
				return size + unit;
			}

			return ! size ? CUSTOM_SIZE_LABEL : size;
		} )
		.join( ' ' );

	return (
		<span style={ { textTransform: 'capitalize' } }>
			{ positionLabel }: { sizes }
		</span>
	);
};

const initialShadow: ShadowPropValue = {
	$$type: 'shadow',
	value: {
		hOffset: {
			$$type: 'size',
			value: { unit: 'px', size: 0 },
		},
		vOffset: {
			$$type: 'size',
			value: { unit: 'px', size: 0 },
		},
		blur: {
			$$type: 'size',
			value: { unit: 'px', size: 10 },
		},
		spread: {
			$$type: 'size',
			value: { unit: 'px', size: 0 },
		},
		color: {
			$$type: 'color',
			value: 'rgba(0, 0, 0, 1)',
		},
		position: null,
	},
};
