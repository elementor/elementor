import * as React from 'react';
import { type ReactNode, type RefObject, useId, useRef, useEffect } from 'react';
import { type PropKey, type PropTypeUtil, type PropValue, sizePropTypeUtil, type SizePropValue, type TransformablePropValue } from '@elementor/editor-props';
import { bindPopover, bindToggle, Box, Grid, Popover, Stack, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { StyledToggleButton } from '../components/control-toggle-button-group';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { SizeControl } from './size-control';

type MultiSizePropValue = Record< PropKey, PropValue >;

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

function isEqualValues ( items, values ) {

	if ( ! values ) {
		return true;
	}

	const propValue = {};

	items.forEach( ( item ) => {
		propValue[ item.bind ] = values?.value?.[ item.bind ] ?? null;
	} );

	const allValues = Object.values( propValue ).map( ( value ) => JSON.stringify( value ) );

	return allValues.every( ( value ) => value === allValues[ 0 ] );
}

export function EqualUnequalSizesControl< TMultiPropType extends string, TPropValue extends MultiSizePropValue >( {
	label,
	icon,
	tooltipLabel,
	items,
	multiSizePropTypeUtil,
}: Props< TMultiPropType, TPropValue > ) {
	const popupId = useId();
	const popupState = usePopupState( { variant: 'popover', popupId } );

	const rowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ) ];

	const {
		propType: multiSizePropType,
		value: multiSizeValue,
		setValue: setMultiSizeValue,
		disabled: multiSizeDisabled,
	} = useBoundProp( multiSizePropTypeUtil );

	const { value: sizeValue, setValue: setSizeValue } = useBoundProp( sizePropTypeUtil );

	const { value: masterValue, setValue: setMasterValue, placeholder: masterPlaceholder } = useBoundProp();

	const getMultiSizeValues = ( sourceValue ) => {

		if ( multiSizePropTypeUtil.isValid( sourceValue ) ) {
			return sourceValue.value;
		}

		if ( ! sourceValue ) {
			return null;
		}

		const propValue = {};

		items.forEach( ( item ) => {
			propValue[ item.bind ] = sourceValue;
		} );

		const derived = multiSizePropTypeUtil.create( propValue );

		return derived?.value;
	};

	const isShowingGeneralIndicator = ! popupState.isOpen;

	const derivedValue = getMultiSizeValues( masterValue );
	const derivedPlaceholder = getMultiSizeValues( masterPlaceholder );

	const isMixedPlaceholder = ! masterValue && ( ! isEqualValues( items, multiSizePropTypeUtil.create( derivedPlaceholder ) ) );
	const isMixed = isMixedPlaceholder || ! isEqualValues( items, multiSizePropTypeUtil.create( derivedValue ) );

	const applyMultiSizeValue = ( newValue ) => {

		const newPropValue = multiSizePropTypeUtil.create( newValue );

		if ( isEqualValues( items, newPropValue ) ) {
			setMasterValue( Object.values( newValue )?.pop() ?? null );
			return;
		}

		setMasterValue( newPropValue );
	};

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
						<Box flexGrow={ 1 }>
							<SizeControl
								placeholder={ isMixed ? __( 'Mixed', 'elementor' ) : undefined }
								enablePropTypeUnits={ ! isMixed || ! isMixedPlaceholder }
								anchorRef={ rowRefs[ 0 ] }
							/>
						</Box>
						<Tooltip title={ tooltipLabel } placement="top">
							<StyledToggleButton
								size={ 'tiny' }
								value={ 'check' }
								sx={ { marginLeft: 'auto' } }
								{ ...bindToggle( popupState ) }
								selected={ popupState.isOpen }
								isPlaceholder={ isMixedPlaceholder }
								aria-label={ tooltipLabel }
							>
								{ icon }
							</StyledToggleButton>
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
					value={ derivedValue }
					placeholder={ derivedPlaceholder }
					setValue={ applyMultiSizeValue }
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
