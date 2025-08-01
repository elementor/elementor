import * as React from 'react';
import { type ReactNode, type RefObject, useId, useRef } from 'react';
import { type PropKey, type PropTypeUtil, sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';
import { bindPopover, bindToggle, Grid, Popover, Stack, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { SizeControl } from './size-control';

type MultiSizePropValue = Record< PropKey, SizePropValue >;

type Item = {
	icon: ReactNode;
	label: string;
	bind: PropKey;
};

export type EqualUnequalItems = [ Item, Item, Item, Item ];

type Props< TMultiPropType extends string, TPropValue extends MultiSizePropValue > = {
	label: string;
	icon: ReactNode;
	tooltipLabel: string;
	items: EqualUnequalItems;
	multiSizePropTypeUtil: PropTypeUtil< TMultiPropType, TPropValue >;
};

const isEqualSizes = ( propValue: MultiSizePropValue, items: EqualUnequalItems ) => {
	const values = Object.values( propValue );

	if ( values.length !== items.length ) {
		return false;
	}

	const [ firstValue, ...restValues ] = values;

	return restValues.every(
		( value ) => value?.value?.size === firstValue?.value?.size && value?.value?.unit === firstValue?.value?.unit
	);
};

export function EqualUnequalSizesControl< TMultiPropType extends string, TPropValue extends MultiSizePropValue >( {
	label,
	icon,
	tooltipLabel,
	items,
	multiSizePropTypeUtil,
}: Props< TMultiPropType, TPropValue > ) {
	const popupId = useId();
	const popupState = usePopupState( { variant: 'popover', popupId } );

	const {
		propType: multiSizePropType,
		value: multiSizeValue,
		setValue: setMultiSizeValue,
		disabled: multiSizeDisabled,
	} = useBoundProp( multiSizePropTypeUtil );

	const { value: sizeValue, setValue: setSizeValue } = useBoundProp( sizePropTypeUtil );

	const rowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ) ];

	const splitEqualValue = () => {
		if ( ! sizeValue ) {
			return null;
		}

		return items.reduce< TPropValue >(
			( acc, { bind } ) => ( { ...acc, [ bind ]: sizePropTypeUtil.create( sizeValue ) } ),
			{} as TPropValue
		);
	};

	const setNestedProp = ( newValue: TPropValue ) => {
		const newMappedValues = {
			...( multiSizeValue ?? splitEqualValue() ),
			...newValue,
		};

		const isEqual = isEqualSizes( newMappedValues, items );

		if ( isEqual ) {
			return setSizeValue( Object.values( newMappedValues )[ 0 ]?.value );
		}

		setMultiSizeValue( newMappedValues );
	};

	const getMultiSizeValues = () => {
		if ( multiSizeValue ) {
			return multiSizeValue;
		}

		return splitEqualValue() ?? null;
	};

	const isShowingGeneralIndicator = ! popupState.isOpen;

	const isMixed = !! multiSizeValue;

	return (
		<>
			<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap" ref={ rowRefs[ 0 ] }>
				<Grid item xs={ 6 }>
					{ ! isShowingGeneralIndicator ? (
						<ControlFormLabel>{ label }</ControlFormLabel>
					) : (
						<ControlLabel>{ label }</ControlLabel>
					) }
				</Grid>
				<Grid item xs={ 6 }>
					<Stack direction="row" alignItems="center" gap={ 1 }>
						<SizeControl
							placeholder={ isMixed ? __( 'Mixed', 'elementor' ) : undefined }
							anchorRef={ rowRefs[ 0 ] }
						/>
						<Tooltip title={ tooltipLabel } placement="top">
							<ToggleButton
								size={ 'tiny' }
								value={ 'check' }
								sx={ { marginLeft: 'auto' } }
								{ ...bindToggle( popupState ) }
								selected={ popupState.isOpen }
								aria-label={ tooltipLabel }
							>
								{ icon }
							</ToggleButton>
						</Tooltip>
					</Stack>
				</Grid>
			</Grid>
			<Popover
				disablePortal
				disableScrollLock
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				{ ...bindPopover( popupState ) }
				slotProps={ {
					paper: { sx: { mt: 0.5, width: rowRefs[ 0 ].current?.getBoundingClientRect().width } },
				} }
			>
				<PropProvider
					propType={ multiSizePropType }
					value={ getMultiSizeValues() }
					setValue={ setNestedProp }
					isDisabled={ () => multiSizeDisabled }
				>
					<PopoverContent p={ 1.5 }>
						<PopoverGridContainer ref={ rowRefs[ 1 ] }>
							<MultiSizeValueControl item={ items[ 0 ] } rowRef={ rowRefs[ 1 ] } />
							<MultiSizeValueControl item={ items[ 1 ] } rowRef={ rowRefs[ 1 ] } />
						</PopoverGridContainer>
						<PopoverGridContainer ref={ rowRefs[ 2 ] }>
							<MultiSizeValueControl item={ items[ 2 ] } rowRef={ rowRefs[ 2 ] } />
							<MultiSizeValueControl item={ items[ 3 ] } rowRef={ rowRefs[ 2 ] } />
						</PopoverGridContainer>
					</PopoverContent>
				</PropProvider>
			</Popover>
		</>
	);
}

const MultiSizeValueControl = ( { item, rowRef }: { item: Item; rowRef: RefObject< HTMLDivElement > } ) => {
	return (
		<PropKeyProvider bind={ item.bind }>
			<Grid item xs={ 6 }>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlLabel>{ item.label }</ControlLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<SizeControl startIcon={ item.icon } anchorRef={ rowRef } />
					</Grid>
				</Grid>
			</Grid>
		</PropKeyProvider>
	);
};
